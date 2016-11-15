import { parse } from 'url';
import * as fs from 'fs';
import { Observable } from 'rxjs';

import Config from '../../config';
import { SharePointAuthenticatedRequest } from './sp.rest_authenticated';
import { IHttpReqOptions, INtlmOptions } from './sp.rest_authenticated.interfaces';

const request = new SharePointAuthenticatedRequest();

export class UploadFile {

  REQ_OPTIONS: IHttpReqOptions = {
    method: 'GET',
    json: true,
    headers: { accept: 'application/json;odata=verbose' }
  };

  NTLM_OPTIONS: INtlmOptions = {
    hostname: parse(Config.SP_ROOT).hostname,
    username: Config.USER_NAME,
    password: Config.USER_PASSWORD,
    domain: Config.USER_DOMAIN
  }

  updateOrAddFile(folder: string) {
    return this.findFile(folder).mergeMap(result => {
      if (result.error || !!result.body.error) {
        console.log(`Can't find this file, I'm going to upload it!`);
        return this.addFile(folder);
      }
      console.log(`Folder exists, noting to see here...`);
      return Observable.empty();
    });
  }

  /**
   * Finds the specified file
   * @param {string} folder - The site collection relative path to the folder
   * @param {string} filename - The name of the file to find
   * @return {Observable} - Observable of the file
   */
  private findFile(folder: string) {
    this.REQ_OPTIONS.url = `${Config.SP_ROOT}/_api/web/getfilebyserverrelativeurl('${folder}/${Config.SP_FILE_NAME}')/$value`;
    return request.sendRequest(this.REQ_OPTIONS, this.NTLM_OPTIONS);
  }

  private addFile(folder: string) {

    return this.getFsFile(`${Config.APP_SRC}/${Config.SP_FILE_NAME}`)
      .mergeMap(res => {
        this.REQ_OPTIONS.url = `${Config.SP_ROOT}/_api/web/getfolderbyserverrelativeurl('${folder}')/files/add(url='${Config.SP_FILE_NAME}', overwrite=true)`;
        this.REQ_OPTIONS.method = 'POST';
        this.REQ_OPTIONS.json = false;
        this.REQ_OPTIONS.binary = true;
        this.REQ_OPTIONS.body = res;
        this.REQ_OPTIONS.headers = {
          'accept': 'application/json;odata=verbose',
          //'content-type': 'application/json;odata=verbose',
          'content-length': res.byteLength
        };
        return request.sendRequest(this.REQ_OPTIONS, this.NTLM_OPTIONS);
      });

  }

  private getFsFile(fileUrl: string) {
    let readFileObservable = Observable.bindNodeCallback(fs.readFile);
    return readFileObservable(fileUrl);
  }

}
