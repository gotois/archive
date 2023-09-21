import { format } from 'quasar'

const productName = 'Contract Keeper'
const { humanStorageSize } = format

export default {
  productName,
  organization: {
    prodid: `-//GIC DAO//NONSGML ${productName}//RU`,
  },
  opensearch: {
    title: 'Search in the archive of contracts',
  },
  pages: {
    create: {
      title: 'Create a contract',
    },
    archive: {
      title: 'Archive of contracts',
    },
    auth: {
      title: 'Authorization',
      caption: 'Enter key',
    },
    privacy: {
      title: 'Privacy policy',
    },
    tutorial: {
      welcome: { title: `Welcome to "${productName}"` },
      info: { title: 'How we works' },
      agreement: { title: 'Terms of use' },
      oidc: { title: 'OIDC' },
      final: { title: 'Agreement for use' },
    },
    pricing: {
      title: 'Pricing: plans for every',
    },
    unknown: {
      seo: {
        title: 'Page not found',
      },
      title: '404',
      description: 'Oops. Empty...',
      submit: 'Go back to the main page',
    },
  },
  login: {
    oidcIssuer: 'Your OIDC Issuer: {oidcIssuer}',
    authentication: 'Authenticate',
  },
  list: {
    explore: 'Clear Search',
    create: 'Create contract',
    calendar: 'Open calendar',
  },
  archive: {
    search: 'Search',
    tooltip: 'Start typing',
    empty: 'Add your first contract.',
    example: 'Example:',
    searchEmpty: 'Nothing found. Try changing your search options.',
    filterEmpty: 'Nothing is selected.',
    notfound: 'No results',
  },
  header: {
    create: 'Create',
    archive: 'Archive',
    demo: 'Demo',
    free: 'Free',
  },
  navigation: {
    version: 'v.{version}',
    title: 'Settings',
    register: 'Registration',
    signout: 'Exit from SOLiD',
    signin: 'Login with WebID',
    support: {
      free: {
        label: 'Leave a review',
        tooltip: 'If you find an error, please write to us about it.',
      },
      premium: {
        label: 'Support',
        tooltip: 'Please write to us.',
      },
      vip: {
        label: 'Support',
        tooltip: 'Please call to us.',
      },
    },
    back: 'Back',
    noscript: 'Please enable JavaScript to run the application.',
  },
  documentTypes: {
    title: 'Contract types',
  },
  settings: {
    native: {
      profile: 'My profile',
      title: 'Database',
      description: 'Loading and unloading your contracts.',
      import: 'Select contract database file',
      submit: 'Import contracts',
      export: 'Export contracts',
      otp: 'Password login',
    },
    consumer: {
      description: 'Change your full name or email in new contracts.',
    },
    otp: {
      removeCode: 'Remove PIN',
      addCode: 'Set PIN',
      description: 'Enter a numeric PIN to log into the application.',
    },
    keychain: {
      title: 'Manage Certificates',
      label: 'Export Certificate',
      tooltip: 'Export certificate to a file',
    },
    clean: {
      description: 'This action will permanently delete your contracts.',
      label: 'Confirm the deletion of your contract database.',
      ok: 'Delete',
      okAll: 'Delete + Pod',
      cancel: 'Cancel',
      submit: 'Perform Cleanup',
    },
    language: {
      title: 'Language',
    },
  },
  oidc: {
    issuerHint: 'Select URL address',
    tutorialHint: 'OIDC Issuer is the URL of your SOLID provider',
    label: 'OIDC Issuer Address',
    login: 'Log in',
    skip: 'Skip',
    issuerTooltipEmpty: 'Data is required to sign contracts.',
    issuerTooltipLogin: 'Log in through {oidcIssuer}.',
  },
  contract: {
    rules: 'Enter contract type',
    type: 'Contract type',
    hint: {
      desktop: 'Select contract type. Press "Tab" or "⏎" to create a new one',
      mobile: 'Press "Enter" on the keyboard to create a new one',
    },
    option: 'Create new type',
    editDialog: {
      message: 'Enter new description:',
      success: 'Data updated',
      fail: 'Update failed',
    },
    removeDialog: {
      ok: 'Delete',
      cancel: 'Cancel',
      message: 'Are you sure you want to delete? This action cannot be undone.',
      isLoginMessage:
        'Are you sure you want to delete? This action cannot be undone.\nNote: Data will not be deleted from your Pod.',
      success: 'Contract "{name}" successfully deleted.',
      fail: 'There was a problem deleting the data.',
    },
  },
  consumer: {
    type: 'Full name',
    email: 'Email',
    emailRules: 'Enter email address',
    rules: 'Enter consumer (client) of the service',
    save: 'Save',
    success: 'Profile updated',
  },
  wallet: {
    label: 'Private Key Solana',
    open: 'Solana Wallet Dialog',
    disconnected: 'Wallet disconnected',
    accountChanged: 'Account changed',
    fail: 'Error binding crypto wallet',
    hint: 'Enter the address of your Private Key from Solana or log in through a wallet',
  },
  customer: {
    rules: 'Enter performer',
    type: 'Performer',
    hintType: 'Set Entity or Individual',
    hint: 'Performer full name, INN, or WebID',
    contact: 'Contact',
    hintContact: 'Use Email, URL or Tel',
  },
  description: {
    type: 'Note',
    hint: 'Use Plain Text or Markdown for note',
  },
  duration: {
    noLimit: 'No expiration',
    from: 'Contract start date',
    fromHint: 'Application submission date',
    to: 'Contract end date',
    toHint: 'Application end date',
    close: 'Close',
    infinity: 'Unlimited',
  },
  files: {
    type: 'Attached documents',
    hint: 'Add documents in PDF, PNG, or JPG format.',
  },
  contractForm: {
    submit: 'Add',
    date: 'Open calendar',
  },
  tutorial: {
    welcome: {
      title: `Welcome to ${productName}`,
      body: 'Convenient and secure recording of any agreements on your devices.',
      ok: 'Accept and Continue',
      demoHint: 'Start without authorization you will be Demo sign. Continue?',
    },
    info: {
      title: 'How our service works',
      body:
        'Our service works as follows: we record the terms of agreements in a reliable storage accessible only to you, either on your physical device or on your SOLID server.' +
        "<br><br>To ensure the security and confidentiality of your information, our application uses the browser's internal storage, which is only accessible from your current device. Your data never leaves your device without your explicit permission." +
        '<br><br>Therefore, when you use our service, you can be confident in the safety and control of your data.',
    },
    agreement: {
      title: 'User Agreement',
      caption: 'Accept the user agreement',
      body:
        'We want to assure you that our service does not collect any of your personal information. We value your privacy and pay great attention to protecting your data.' +
        '<br><br>Our application is distributed "as is", without any warranties or obligations. We make every effort to ensure its functionality and security, but we are not responsible for any errors or issues that may arise from its use.' +
        '<br><br>The [source code of the application](https://github.com/gotois/archive) is distributed under the license:' +
        '<br>[GNU General Public License v3.0](https://github.com/gotois/archive/blob/master/LICENSE).' +
        '<br><br>The full user agreement is available at: [User Agreement](https://archive.gotointeractive.com/privacy). We recommend that you carefully read it to fully understand the terms of use of our service.',
    },
    wallet: {
      title: 'Connecting Crypto Wallet',
      skip: 'Skip',
      caption: 'Use your cryptographic key',
      body: 'The application uses the [Solana](https://solana.com) blockchain. To confirm your transactions, use the [Phantom](https://phantom.app) wallet or enter your secret key.',
      ok: 'Next',
    },
    oidc: {
      title: 'Connecting WebID',
      caption: 'Provide your unique identifier',
      body:
        'You can store your contracts in the cloud; our service uses SOLiD technology. To authenticate, log in using your [OIDC Issuer](# "OpenID Connect Issuer") address.' +
        "<br><br>If you have any questions or need assistance, please refer to the technical documentation of the standard or contact our [support team](mailto:support{'@'}gotointeractive.com). We are ready to answer all your questions regarding the use of our service.",
      ok: 'Next',
    },
    data: {
      title: 'Confirm Your Account',
      body: 'To use the application, use your name and email address. Add your cryptographic key DID',
      hint: 'To establish your contract identity, you need to know your decentralized identifier.',
      ok: 'Start',
    },
  },
  pricing: {
    free: {
      title: 'Free',
      description: 'Service: Contract storage',
      price: 'per user/month',
      ok: 'Start Free',
      support: {
        title: 'Support',
        values: {
          '1': 'Text feedback',
          '2': 'Stories video',
        },
      },
      functions: {
        title: 'Base functions',
        values: {
          '1': 'Save and search contracts offline',
          '2': 'Save to external SOLiD server',
        },
      },
    },
    premium: {
      title: 'Premium',
      description: 'Project: Full liability management',
      price: 'per user/month',
      ok: 'Start a trial',
      support: {
        title: 'Premium Support',
        values: {
          '1': 'Everything included in Free, plus...',
          '2': 'E-mail feedback',
        },
      },
      functions: {
        title: 'Extended functions',
        values: {
          '1': 'Everything included in Free, plus...',
          '2': 'Crypto sign',
          '3': '10gb space to SOLiD server',
          '4': 'MINT NFT',
          '5': 'Verification',
          '6': 'PDF analyze',
          '7': 'GIC Court',
        },
      },
    },
    vip: {
      title: 'VIP',
      description: 'Solution: “Pocket Lawyer”',
      price: 'per user/month',
      ok: 'Contact Sales',
      support: {
        title: 'Luxury Support',
        values: {
          '1': 'Everything included in Premium, plus...',
          '2': 'Voice help 24/7',
          '3': 'Privileged training events',
        },
      },
      functions: {
        title: 'Individual functions',
        values: {
          '1': 'Everything included in Premium, plus...',
          '2': 'Telemetry off',
        },
      },
    },
  },
  archiveList: {
    remove: 'Delete',
    edit: 'Edit',
    pod: 'Pod',
    openFile: 'Open document window',
    closeFile: 'Close document window',
    shareFile: 'Share document',
  },
  database: {
    fileSize: 'Select a file up to ' + humanStorageSize(1024 * 1024 * 1024 * 2),
    fileImport: 'Start database import procedure',
    fileExport: 'Export database to file',
    removeDatabase: 'Perform database deletion',
    pod: {
      disconnected: 'You have disconnected from your Pod',
      sync: 'Sync with Pod',
    },
  },
  searchDialog: {
    searchText: 'Contract type or performer',
    cancel: 'Close',
  },
  components: {
    otp: {
      processing: 'Please wait...',
      fail: 'Invalid key',
      pinDialog: {
        message: 'Are you sure you want to remove the PIN?',
        success: 'Key disabled',
        fail: 'Error occurred',
      },
      saveDialog: {
        message: 'Are you sure you want to save the PIN?',
        success: 'PIN saved',
        fail: 'Error in saving PIN',
      },
    },
    oidcIssuer: {
      label: 'URL Address',
      input: 'Enter your OIDC Issuer address:',
      fail: 'OIDC Issuer cannot be empty',
      processing: 'Authenticating. Please wait...',
      authorizeDialog: {
        message:
          'Your contracts will not be saved on the SOLiD server. You will not be able to create tokens for your documents. Continue?',
        fail: 'Error occurred while logging in with OIDC',
      },
    },
    keypair: {
      generate: {
        label: 'Generate new DID',
        tooltip: 'Generate a new key',
      },
      import: {
        label: 'Import Key File',
        tooltip: 'Import an existing key',
        fail: 'Error occurred while reading the file',
      },
      export: {
        dialog: {
          message: 'Do you want to save the DID key locally?',
          success: "Keys are generated and stored in your device's memory.",
          fail: 'Your key could not be saved locally on the device.',
        },
      },
    },
    database: {
      fileImportDialog: {
        title: 'Import Contracts',
        message: 'Click OK to start the import procedure',
        fail: 'Import failed',
      },
      fileRejected: 'The selected file is too large',
      fileExportDialog: {
        title: 'Export Contracts',
        prompt: 'Enter the filename for the contracts:',
        message: 'Preparing...',
        progress: 'Creating... {percentage}%',
        success: 'File saved',
        fail: 'Error exporting file',
      },
    },
    databaseRemove: {
      success: 'Database removed. Please wait for the page to reload.',
      fail: 'An error occurred.',
    },
    archiveList: {
      sheet: {
        title: 'Select an action',
        link: {
          label: 'Share link',
          success: 'Link copied to clipboard',
          fail: 'Copy failed',
        },
        share: {
          label: 'Share document',
          fail: 'Error sharing file',
        },
        event: {
          native: {
            label: 'Download ICS',
            fail: 'Error downloading file',
          },
          google: {
            label: 'Add to Google Calendar',
          },
        },
        upload: {
          label: 'Upload to POD',
          success: 'Data written to your Pod',
          fail: 'Error writing data',
        },
        mail: {
          label: 'Send message',
        },
        telephone: {
          label: 'Call',
        },
        law: {
          label: 'Challenge in court',
        },
      },
    },
    contractForm: {
      resetDialog: {
        message: 'Are you sure you want to clear the form?',
      },
      selectDate: {
        fail: 'Start date cannot be later than today',
      },
      wrongDate: {
        fail: 'Unknown date type',
      },
      submitDate: {
        invalidStartDate: 'Invalid application submission date',
        invalidEndDate: 'Invalid application end date',
        invalidSelectDate: 'Start date cannot be later than end date',
        success: 'Record {id} added',
        fail: 'Record failed',
        redirect: 'Go',
      },
    },
    imageContextMenu: {
      open: 'Open file',
      copy: 'Copy to clipboard',
      success: 'Data copied to clipboard',
      fail: 'Error occurred',
    },
  },
  copy: {
    success: 'Copied successfull',
  },
}
