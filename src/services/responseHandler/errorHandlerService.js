import MessageList from 'constants/notification/responseMessage';

export function errorHandler(error) {
  let errorMsg = null;
  if (
    error.error &&
    error.error.deviceValidationFailures &&
    error.error.deviceValidationFailures[0] &&
    error.error.deviceValidationFailures[0].code
  ) {
    errorMsg = getErrorMsg(error.error.deviceValidationFailures[0].code, true);
  } else {
    errorMsg = getErrorUndefinedMsg();
  }

  return errorMsg;
}

export function getErrorMsg(messageID, returnDefaultMsg) {
  let errorMsg = 'UNDEFINED';

  if (messageID !== null && messageID !== undefined && messageID !== '') {
    let errorMsgObj = MessageList[messageID];
    if (errorMsgObj) {
      errorMsg = errorMsgObj;
    }
  }

  return errorMsg === 'UNDEFINED' ? (returnDefaultMsg ? getErrorUndefinedMsg() : null) : errorMsg;
}

export function getErrorUndefinedMsg() {
  return 'ERROR NOT DEFINED!';
}

// openSnackBar(message: string, action: string, horizontalPosition: string, verticalPosition: string, duration: string) {
//     this.snackBar.open(message, action, {
//         duration: 2000,
//         horizontalPosition: "center",
//         verticalPosition: "bottom",
//         // panelClass: ['mat-toolbar', 'light-blue'] mat-warn
//     });
// }

// openDialog(message: string) {
//     const dialogRef = this.dialog.open(MsgDialog, {
//         width: '400px',
//         data: { msg: message }
//     });

//     dialogRef.afterClosed().subscribe(result => {
//         console.log('The dialog was closed');
//     });
// }
