import {
  TInput,
  TTextarea,
  // TSelect,
  TRadio,
  TCheckbox,
  TButton,
  // TInputGroup,
  TCard,
  // TAlert,
  TModal,
  // TDropdown,
  // TRichSelect,
  // TPagination,
  // TTag,
  // TRadioGroup,
  // TCheckboxGroup,
  // TTable,
  // TDatepicker,
  // TToggle,
  // TDialog,
} from 'vue-tailwind/dist/components';

export const tailwindCss = {
  // Use the following syntax
  // {component-name}: {
  //   component: {importedComponentObject},
  //   props: {
  //     {propToOverride}: {newDefaultValue}
  //     {propToOverride2}: {newDefaultValue2}
  //   }
  // }
  't-card': {
    component: TCard,
    props: {
      fixedClasses: {
        wrapper: 'border rounded shadow-sm ',
        body: 'p-3',
        header: 'border-b p-3 rounded-t',
        footer: 'border-t p-3 rounded-b',
      },
      classes: {
        wrapper: 'bg-gray border-black-100',
        body: '',
        header: 'border-black-100',
        footer: 'border-black-100',
      },
      variants: {
        danger: {
          wrapper: 'bg-red-50 text-red-700 border-red-200',
          header: 'border-red-200 text-red-700',
          footer: 'border-red-200 text-red-700',
        },
      },
    },
  },
  't-input': {
    component: TInput,
    props: {
      classes: 'border-2 block w-full rounded text-gray-800',
    },
  },
  't-textarea': {
    component: TTextarea,
    props: {
      classes: 'border-2 block w-full rounded text-gray-800',
    },
  },
  't-button': {
    component: TButton,
    props: {
      classes: 'text-white bg-green-500 border border-transparent rounded shadow-sm hover:bg-green-600',
    },
  },
  't-modal': {
    component: TModal,
    fixedClasses: {
      overlay: 'z-40  overflow-auto scrolling-touch left-0 top-0 bottom-0 right-0 w-full h-full fixed bg-opacity-50',
      wrapper: 'relative mx-auto z-50 max-w-lg px-3 py-12',
      modal: 'overflow-visible relative  rounded',
      body: 'p-3',
      header: 'border-b p-3 rounded-t',
      footer: ' p-3 rounded-b',
      close: 'flex items-center justify-center rounded-full absolute right-0 top-0 -m-3 h-8 w-8 transition duration-100 ease-in-out focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-opacity-50',
    },
    classes: {
      overlay: 'bg-black',
      wrapper: '',
      modal: 'bg-white shadow',
      body: 'p-3',
      header: 'border-gray-100',
      footer: 'bg-gray-100',
      close: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
      closeIcon: 'fill-current h-4 w-4',
      overlayEnterClass: '',
      overlayEnterActiveClass: 'opacity-0 transition ease-out duration-100',
      overlayEnterToClass: 'opacity-100',
      overlayLeaveClass: 'transition ease-in opacity-100',
      overlayLeaveActiveClass: '',
      overlayLeaveToClass: 'opacity-0 duration-75',
      enterClass: '',
      enterActiveClass: '',
      enterToClass: '',
      leaveClass: '',
      leaveActiveClass: '',
      leaveToClass: '',
    },
    variants: {
      danger: {
        overlay: 'bg-red-100',
        header: 'border-red-50 text-red-700',
        close: 'bg-red-50 text-red-700 hover:bg-red-200 border-red-100 border',
        modal: 'bg-white border border-red-100 shadow-lg',
        footer: 'bg-red-50',
      },
    },

  },
  't-checkbox': {
    component: TCheckbox,
    props: {
      wrapped: true,
      classes: {
        label: 'text-sm uppercase mx-2 text-gray-700',
        input: 'text-blue-500 transition duration-100 ease-in-out border-gray-300 rounded shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed',
        inputWrapper: 'inline-flex',
        wrapper: 'flex items-center',
        // labelChecked: '',
        // inputWrapperChecked: '',
        // wrapperChecked: '',
      },
      // Variants and fixed classes in the same `object` format ...
    },
  },
  't-radio': {
    component: TRadio,
    props: {
      wrapped: true,
      classes: {
        label: 'text-sm uppercase mx-2 text-gray-700',
        input: 'text-blue-500 transition duration-100 ease-in-out border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 focus:ring-offset-0  disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out',
        inputWrapper: 'inline-flex',
        wrapper: 'flex items-center',
        // labelChecked: '',
        // inputWrapperChecked: '',
        // wrapperChecked: '',
      },
      // Variants and fixed classes in the same `object` format ...
    },
  },
};
