# OfficeAngular

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.2.2.

## Development server

The self-signed SSL certificates used for development expire after 30 days. Run `npm run ssl:config` to create new ones when needed.

Run `npm run dev-server` for a dev server. Run `npm run start:desktop` to open Word and sideload the add-in automatically.

To run on the web, get the shareable link for a document you have access to, then run `npm run start:web -- --document https://thedocumenturl` to open Word in your default browser and sideload the add-in. If this doesn't work on the first try, you may need to visit https://localhost:4200 first to let your browser know to trust the self-signed certificate that is being used.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `npm run build:dev` to build the project. The build artifacts will be stored in the `dist/` directory. Use `npm run build` for a production build.

## Running unit tests

Run `npm run test` to execute the unit tests via [Karma](https://karma-runner.github.io). Use `npm run test:coverage` to generate a coverage report in `/coverage`.

## Running end-to-end tests

Run `npm run e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Debugging

This template supports debugging using any of the following techniques:

- [Use a browser's developer tools](https://docs.microsoft.com/office/dev/add-ins/testing/debug-add-ins-in-office-online)
- [Attach a debugger from the task pane](https://docs.microsoft.com/office/dev/add-ins/testing/attach-debugger-from-task-pane)
- [Use F12 developer tools on Windows 10](https://docs.microsoft.com/office/dev/add-ins/testing/debug-add-ins-using-f12-developer-tools-on-windows-10)

## Additional resources

* [Office add-in documentation](https://docs.microsoft.com/office/dev/add-ins/overview/office-add-ins)
* More Office Add-in samples at [OfficeDev on Github](https://github.com/officedev)

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information, see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
