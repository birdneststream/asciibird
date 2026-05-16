// Import/Export handlers — extracted from Dashboard.vue
import { ref } from 'vue';
import LZString from 'lz-string';
import {
  parseMircAscii,
  exportMirc,
  exportPlainText,
  downloadFile,
  mergeLayers,
} from '../ascii';
import { downloadAnsi } from '../utils/ansiExport';
import { downloadHtml, exportHtmlFragment } from '../utils/htmlExport';
import { parseAnsiAscii } from '../utils/ansiImport';
import { useAsciiBirdStore } from '../store';
import { useModalStore } from '../store/modal';
import { useExportAscii } from './useExportAscii';
import type { DialogResult } from './useDialog';

export interface UseImportExportOptions {
  toastShow: (text: string, opts?: {
    type?: 'info' | 'success' | 'error';
    duration?: number;
  }) => void;
  dialogPrompt: (opts: {
    title?: string;
    text?: string;
    inputValue?: string;
  }) => Promise<DialogResult>;
}

// ─── Module-level helpers ───────────────────────────────────────

function importAsciibirdState(
  store: ReturnType<typeof useAsciiBirdStore>,
  toastShow: UseImportExportOptions['toastShow'],
  fileContents: string,
): void {
  try {
    const contents = JSON.parse(
      LZString.decompressFromEncodedURIComponent(fileContents),
    );
    store.changeState({ ...contents });
  } catch {
    toastShow('Failed to import ASCIIBIRD state. File may be corrupted.', {
      type: 'error',
    });
  }
}

function exportAsciibirdState(
  store: ReturnType<typeof useAsciiBirdStore>,
  toastShow: UseImportExportOptions['toastShow'],
): void {
  try {
    const output = LZString.compressToEncodedURIComponent(
      JSON.stringify(store.state),
    );

    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth() + 1;
    const d = today.getDate();
    const h = today.getHours();
    const mi = today.getMinutes();
    const s = today.getSeconds();

    downloadFile(
      output,
      `asciibird-${y}-${m}-${d}-${h}-${mi}-${s}.asb`,
      'application/gzip',
    );
  } catch (err) {
    toastShow(String(err), { type: 'error' });
  }
}

function doHandleExportPost(
  store: ReturnType<typeof useAsciiBirdStore>,
  modalStore: ReturnType<typeof useModalStore>,
  toastShow: UseImportExportOptions['toastShow'],
  dialogPrompt: UseImportExportOptions['dialogPrompt'],
  lastPostURL: { value: string },
  startExport: (type: 'clipboard' | 'file') => void,
  type: 'file' | 'clipboard' | 'post',
): void {
  if (type === 'post') {
    modalStore.toggleDisableKeyboard(true);
    dialogPrompt({
      title: 'HTTP Post your Ascii',
      text: 'Please input the URL for the HTTP Post sir',
      inputValue: lastPostURL.value,
    }).then((result) => {
      if (result.input === undefined) {
        toastShow('Come on bro. Get it together.', { type: 'error' });
        modalStore.toggleDisableKeyboard(false);
        return;
      }

      if (result.isOk) {
        const asciiText = exportMirc().output.join('');
        lastPostURL.value = result.input;
        const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/octet-stream' },
          body: asciiText,
        };
        fetch(lastPostURL.value, requestOptions)
          .then((response) => {
            if (response.status === 200 || response.status === 201) {
              toastShow('POSTed ascii!', { type: 'success' });
            } else {
              toastShow(
                `Error: ${response.status} ${response.statusText}`,
                { type: 'error' },
              );
            }
          })
          .catch((error) => {
            toastShow(`Error: ${JSON.stringify(error)}`, { type: 'error' });
          });
      }

      modalStore.toggleDisableKeyboard(false);
    });
  } else {
    startExport(type as 'clipboard' | 'file');
  }
}

function doExportAnsi(
  store: ReturnType<typeof useAsciiBirdStore>,
  toastShow: UseImportExportOptions['toastShow'],
): void {
  try {
    const title = (store.currentAscii as { title: string })?.title ?? 'ascii';
    downloadAnsi(title);
    toastShow('Exported ANSI file!', { type: 'success' });
  } catch (err) {
    toastShow(`ANSI export error: ${String(err)}`, { type: 'error' });
  }
}

function doExportPlainText(
  store: ReturnType<typeof useAsciiBirdStore>,
  toastShow: UseImportExportOptions['toastShow'],
  target: 'clipboard' | 'file',
): void {
  try {
    const lines = exportPlainText();
    const text = lines.join('\n');
    const title = (store.currentAscii as { title: string })?.title ?? 'ascii';

    if (target === 'clipboard') {
      navigator.clipboard.writeText(text);
      toastShow('Plain text copied to clipboard!', { type: 'success' });
    } else {
      const filename = title.endsWith('.txt') ? title : `${title}.txt`;
      downloadFile(text, filename, 'text/plain');
      toastShow('Exported plain text file!', { type: 'success' });
    }
  } catch (err) {
    toastShow(`Plain text export error: ${String(err)}`, { type: 'error' });
  }
}

function doExportHtml(
  store: ReturnType<typeof useAsciiBirdStore>,
  toastShow: UseImportExportOptions['toastShow'],
  target: 'clipboard' | 'file',
): void {
  try {
    const title = (store.currentAscii as { title: string })?.title ?? 'ascii';

    if (target === 'clipboard') {
      const blocks = mergeLayers();
      const fragment = exportHtmlFragment(blocks);
      navigator.clipboard.writeText(fragment);
      toastShow('HTML fragment copied to clipboard!', { type: 'success' });
    } else {
      downloadHtml(title);
      toastShow('Exported HTML file!', { type: 'success' });
    }
  } catch (err) {
    toastShow(`HTML export error: ${String(err)}`, { type: 'error' });
  }
}

function doCropToContent(
  store: ReturnType<typeof useAsciiBirdStore>,
  toastShow: UseImportExportOptions['toastShow'],
): void {
  const cropped = store.cropToContentAction();
  if (cropped) {
    toastShow('Canvas cropped to content!', { type: 'success' });
  } else {
    toastShow('Nothing to crop — content already fills edges.', {
      type: 'info',
    });
  }
}

// ─── Composable ─────────────────────────────────────────────────

export function useImportExport(options: UseImportExportOptions) {
  const { toastShow, dialogPrompt } = options;
  const store = useAsciiBirdStore();
  const modalStore = useModalStore();
  const { startExport } = useExportAscii({ checkLimits: true });

  const asciiInput = ref<HTMLInputElement | null>(null);
  const importType = ref<'mirc' | 'asb' | 'ansi' | null>(null);
  const lastPostURL = ref('');

  async function onImport() {
    const input = asciiInput.value;
    if (!input) return;

    const files = input.files;
    if (!files || !files.length) return;

    const filename = files[0].name;
    const fileType = importType.value;

    if (fileType === 'ansi') {
      const bufferReader = new FileReader();
      bufferReader.addEventListener('load', async () => {
        await parseAnsiAscii(
          '',
          filename,
          bufferReader.result as ArrayBuffer,
        );
        input.value = '';
      });
      bufferReader.readAsArrayBuffer(files[0]);
    } else {
      const textReader = new FileReader();
      textReader.addEventListener('load', async () => {
        switch (fileType) {
          case 'asb':
            importAsciibirdStateFn(textReader.result as string);
            break;

          default:
          case 'mirc':
            await parseMircAscii(textReader.result as string, filename);
            break;
        }
        input.value = '';
      });
      textReader.readAsText(files[0]);
    }
  }

  function startImport(type: 'mirc' | 'asb' | 'ansi') {
    importType.value = type;
    asciiInput.value?.click();
  }

  function importAsciibirdStateFn(fileContents: string) {
    importAsciibirdState(store, toastShow, fileContents);
  }

  function handleExport(type: 'file' | 'clipboard' | 'post') {
    doHandleExportPost(
      store, modalStore, toastShow, dialogPrompt,
      lastPostURL, startExport, type,
    );
  }

  function handleExportAnsi() {
    doExportAnsi(store, toastShow);
  }

  function handleExportPlainText(target: 'clipboard' | 'file') {
    doExportPlainText(store, toastShow, target);
  }

  function handleExportHtml(target: 'clipboard' | 'file') {
    doExportHtml(store, toastShow, target);
  }

  function handleCropToContent() {
    doCropToContent(store, toastShow);
  }

  function doExportAsciibirdState() {
    exportAsciibirdState(store, toastShow);
  }

  return {
    asciiInput,
    onImport,
    startImport,
    importAsciibirdState: importAsciibirdStateFn,
    exportAsciibirdState: doExportAsciibirdState,
    handleExport,
    handleExportAnsi,
    handleExportPlainText,
    handleExportHtml,
    handleCropToContent,
  };
}
