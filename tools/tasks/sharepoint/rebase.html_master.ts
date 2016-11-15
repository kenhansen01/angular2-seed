import { parse } from 'url';
import * as Stream from 'stream';
import * as gulp from 'gulp';
import * as util from 'gulp-util';
// import { writeFileSync } from 'fs';

import Config from '../../config';
import { SharePointAuthenticatedRequest, IHttpReqOptions, INtlmOptions, StringSplicer } from '../../utils';

const request = new SharePointAuthenticatedRequest();
//const DOMParser = require('xmldom').DOMParser;
//const XMLSerializer = require('xmldom').XMLSerializer;

//const parser = new DOMParser();
//const serializer = new XMLSerializer();

let reqOptions: IHttpReqOptions = {
  url: `${Config.SP_ROOT}/_api/web/GetFileByServerRelativeUrl('${Config.SP_STARTER_MASTER}')/$value`,
  method: 'GET'
};

let ntlmOptions: INtlmOptions = {
  hostname: parse(Config.SP_ROOT).hostname,
  username: Config.USER_NAME,
  password: Config.USER_PASSWORD,
  domain: Config.USER_DOMAIN,
};

/**
 * Gets original html file for master from SharePoint. Useful after SP updates to make sure masterpages are in line with any changes.
 */
export = (done: any) => {
  return request.sendRequest(reqOptions, ntlmOptions)
    .map(res => {

      console.log(res.headers);
      console.log(res.body);

      let navAppString = '<nav-app>Loading...</nav-app>';
      let addHtmlString = `
    <script>
      // Fixes undefined module function in SystemJS bundle
      function module() {}
      </script>

      <!-- shims:js -->
      <!-- endinject -->

      <% if (ENV === 'dev') { %>
      <script src="<%= APP_BASE %>app/system-config.js"></script>
      <% } %>

      <!-- libs:js -->
      <!-- endinject -->

      <!-- inject:js -->
      <!-- endinject -->

      <% if (ENV === 'dev') { %>
      <script>
      System.import('<%= BOOTSTRAP_MODULE %>')
        .catch(function (e) {
          console.error(e,
            'Report this error at https://github.com/mgechev/angular2-seed/issues');
        });
      </script>
      <% } %>
    `;

      let editBody = StringSplicer(res.body, navAppString, '<div id="s4-bodyContainer">', true);

      return StringSplicer(editBody, addHtmlString, '</body>', false);

    })
    .do(res => {
      console.log(res);

      fileStream(res)
        .pipe(gulp.dest(Config.APP_SRC));
    })
    .subscribe(res => done());
};

function fileStream(contentsString: string): any {

  let file = new util.File({
    cwd: '',
    base: '',
    path: Config.SP_FILE_NAME,
    contents: new Buffer(contentsString)
  });

  let src = new Stream.Readable({ objectMode: true });

  src.push(file);
  src.push(null);

  return src;
}
