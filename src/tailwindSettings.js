import TInput from 'vue-tailwind/dist/t-input';
import TTextarea from 'vue-tailwind/dist/t-textarea';
import TRadio from 'vue-tailwind/dist/t-radio';
import TCheckbox from 'vue-tailwind/dist/t-checkbox';
import TButton from 'vue-tailwind/dist/t-button';
import TCard from 'vue-tailwind/dist/t-card';
import TModal from 'vue-tailwind/dist/t-modal';
import TDialog from 'vue-tailwind/dist/t-dialog';
import TSelect from 'vue-tailwind/dist/t-select';

export const tailwindCss = {
  't-input': {
    component: TInput,
    props: {
      fixedClasses: 'block w-full px-3 py-2 transition duration-100 ease-in-out border rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed',
      classes: 'text-black placeholder-gray-400 bg-white border-gray-300 focus:border-blue-500 ',
      variants: {
        danger: 'border-red-300 bg-red-50 placeholder-red-200 text-red-900',
        success: 'border-green-300 bg-green-50 placeholder-gray-400 text-green-900'
      }
    }
  },
  't-textarea': {
    component: TTextarea,
    props: {
      fixedClasses: 'block w-full px-3 py-2 transition duration-100 ease-in-out border rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed',
      classes: 'text-black placeholder-gray-400 bg-white border-gray-300 focus:border-blue-500 ',
      variants: {
        danger: 'border-red-300 bg-red-50 placeholder-red-200 text-red-900',
        success: 'border-green-300 bg-green-50 placeholder-gray-400 text-green-900'
      }
    }
  },
  't-radio': {
    component: TRadio,
    props: {
      fixedClasses: 'transition duration-100 ease-in-out shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-opacity-50 focus:ring-offset-0  disabled:opacity-50 disabled:cursor-not-allowed',
      classes: 'text-blue-500 border-gray-300',
      variants: {
        error: 'text-red-500 border-red-300',
        success: 'text-green-500 border-green-300'
      }
    }
  },
  't-checkbox': {
    component: TCheckbox,
    props: {
      fixedClasses: 'transition duration-100 ease-in-out rounded shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-opacity-50 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed',
      classes: 'text-blue-500 border-gray-300 ',
      variants: {
        error: 'text-red-500 border-red-300',
        success: 'text-green-500 border-green-300'
      }
    }
  },
  't-button': {
    component: TButton,
    props: {
      fixedClasses: 'transition duration-100 ease-in-out focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed',
      classes: 'text-white bg-gray-500 border border-transparent shadow-sm rounded hover:bg-blue-500',
      variants: {
        secondary: 'text-gray-800 bg-white border border-gray-300 shadow-sm hover:text-gray-600',
        error: 'text-white bg-red-500 border border-transparent rounded shadow-sm hover:bg-red-600',
        success: 'text-white bg-green-500 border border-transparent rounded shadow-sm hover:bg-green-600',
        link: 'text-blue-500 underline hover:text-blue-600'
      }
    }
  },
  't-card': {
    component: TCard,
    props: {
      fixedClasses: {
        wrapper: 'border rounded shadow-sm ',
        body: 'p-1',
        header: 'border-b p-1 rounded-t text-sm',
        footer: 'border-t p-1 rounded-b'
      },
      classes: {
        wrapper: 'bg-gray-200 border-gray-100',
        body: '',
        header: 'border-gray-100',
        footer: 'border-gray-100'
      },
      variants: {
        danger: {
          wrapper: 'bg-red-50 text-red-700 border-red-200',
          header: 'border-red-200 text-red-700',
          footer: 'border-red-200 text-red-700'
        }
      }
    }
  },
  't-modal': {
    component: TModal,
    props: {
      fixedClasses: {
        overlay: 'z-40  overflow-auto scrolling-touch left-0 top-0 bottom-0 right-0 w-full h-full fixed bg-opacity-50',
        wrapper: 'relative mx-auto z-50 max-w-lg px-3 py-12',
        modal: 'overflow-visible relative rounded',
        body: 'p-3',
        header: 'border-b p-3 rounded-t font-bold',
        footer: 'p-1 rounded-b',
        close: 'flex items-center justify-center rounded-full absolute right-0 top-0 -m-3 h-8 w-8 transition duration-100 ease-in-out focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-opacity-50'
      },
      classes: {
        overlay: 'bg-black',
        wrapper: '',
        modal: 'bg-white shadow',
        body: 'p-1',
        header: 'border-gray-100',
        footer: 'bg-gray-100',
        close: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
        closeIcon: 'fill-current h-4 w-4',
        overlayEnterClass: 'opacity-0',
        overlayEnterActiveClass: 'transition ease-out duration-100',
        overlayEnterToClass: 'opacity-100',
        overlayLeaveClass: 'opacity-100',
        overlayLeaveActiveClass: 'transition ease-in duration-75',
        overlayLeaveToClass: 'opacity-0',
        enterClass: '',
        enterActiveClass: '',
        enterToClass: '',
        leaveClass: '',
        leaveActiveClass: '',
        leaveToClass: ''
      },
      variants: {
        danger: {
          overlay: 'bg-red-100',
          header: 'border-red-50 text-red-700',
          close: 'bg-red-50 text-red-700 hover:bg-red-200 border-red-100 border',
          modal: 'bg-white border border-red-100 shadow-lg',
          footer: 'bg-red-50'
        }
      }
    }
  },
  't-select': {
    component: TSelect,
    props: {
      wrapped: true,
      classes: {
        wrapper: 'relative',
        input: 'block w-full py-2 pl-3 pr-10 text-black placeholder-gray-400 transition duration-100 ease-in-out bg-white border border-gray-300 rounded shadow-sm bg-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed focus:border-blue-500',
        arrowWrapper: 'pointer-events-none absolute inset-y-0 right-0 flex items-center px-2',
        arrow: 'fill-current h-4 w-4'
      }
    },
    // Variants and fixed classes in the same `object` format ...
  },
  't-dialog': {
    component: TDialog,
    props: {
      fixedClasses: {
        overlay: 'overflow-auto scrolling-touch left-0 top-0 bottom-0 right-0 w-full h-full fixed z-40 bg-opacity-50',
        wrapper: 'relative mx-auto',
        modal: 'overflow-visible relative ',
        close: 'flex items-center justify-center  rounded-full absolute right-0 top-0 -m-3 h-8 w-8 transition duration-100 ease-in-out focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-opacity-50',
        dialog: 'overflow-visible relative',
        iconWrapper: 'flex flex-shrink-0 h-12 items-center justify-center rounded-full w-12 mx-auto',
        icon: 'w-6 h-6',
        okButton: 'block px-4 py-2 text-white transition duration-100 ease-in-out border border-transparent rounded shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed w-full max-w-xs',
        buttons: 'p-3 flex space-x-4 justify-center bg-gray-100 rounded-b'
      },
      classes: {
        close: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
        closeIcon: 'fill-current h-4 w-4',
        overlay: 'bg-black',
        wrapper: 'z-50 max-w-lg px-3 py-12',
        dialog: 'bg-white shadow rounded text-left',
        body: 'p-3 space-y-3',
        buttons: 'bg-gray-100',
        iconWrapper: 'bg-gray-100',
        icon: 'text-gray-500',
        content: 'w-full flex justify-center flex-col',
        titleWrapper: '',
        title: 'text-lg font-semibold text-center',
        textWrapper: 'text-left w-full',
        text: '',
        cancelButton: 'block px-4 py-2 transition duration-100 ease-in-out bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-100 focus:border-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed w-full max-w-xs',
        okButton: 'bg-blue-500 hover:bg-blue-600',
        inputWrapper: 'mt-3 flex items-center space-x-3',
        input: 'block w-full px-3 py-2 text-black placeholder-gray-400 transition duration-100 ease-in-out bg-white border border-gray-300 rounded shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed w-full',
        select: 'block w-full px-3 py-2 text-black placeholder-gray-400 transition duration-100 ease-in-out bg-white border border-gray-300 rounded shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-opacity-50  disabled:opacity-50 disabled:cursor-not-allowed w-full',
        radioWrapper: 'flex items-center space-x-2',
        radio: 'text-blue-500 transition duration-100 ease-in-out border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-opacity-50 focus:ring-offset-0  disabled:opacity-50 disabled:cursor-not-allowed',
        radioText: '',
        checkboxWrapper: 'flex items-center space-x-2',
        checkbox: 'text-blue-500 transition duration-100 ease-in-out border-gray-300 rounded shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-opacity-50 focus:ring-offset-0  disabled:opacity-50 disabled:cursor-not-allowed',
        checkboxText: '',
        errorMessage: 'text-red-500 block text-sm',
        busyWrapper: 'absolute bg-opacity-50 bg-white flex h-full items-center justify-center left-0 top-0 w-full',
        busyIcon: 'animate-spin h-6 w-6 fill-current text-gray-500',
        overlayEnterClass: 'opacity-0',
        overlayEnterActiveClass: 'transition ease-out duration-100',
        overlayEnterToClass: 'opacity-100',
        overlayLeaveClass: 'opacity-100',
        overlayLeaveActiveClass: 'transition ease-in duration-75',
        overlayLeaveToClass: 'opacity-0',
        enterClass: '',
        enterActiveClass: '',
        enterToClass: '',
        leaveClass: '',
        leaveActiveClass: '',
        leaveToClass: ''
      },
      variants: {
        danger: {
          overlay: 'bg-red-100',
          okButton: 'bg-red-500 hover:bg-red-600',
          iconWrapper: 'bg-red-50',
          buttons: 'bg-red-50',
          icon: 'text-red-500'
        },
        horizontal: {
          body: 'p-3 flex space-x-3',
          title: 'text-lg font-semibold'
        }
      }
    }
  }
}
