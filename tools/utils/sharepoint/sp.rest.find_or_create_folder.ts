import { parse } from 'url';
import { Observable } from 'rxjs/Rx';

import Config from '../../config';
import { SharePointAuthenticatedRequest } from './sp.rest_authenticated';
import { IHttpReqOptions, INtlmOptions } from './sp.rest_authenticated.interfaces';

const request = new SharePointAuthenticatedRequest();

export class FindOrCreateFolders {

  REQ_OPTIONS: IHttpReqOptions = {
    method: 'GET',
    json: true,
    headers: { accept: 'application/json;odata=verbose' }
  };

  NTLM_OPTIONS: INtlmOptions = {
    hostname: parse(Config.SP_ROOT).hostname,
    username: Config.USER_NAME,
    password: Config.USER_PASSWORD,
    domain: Config.USER_DOMAIN,
  };

  /**
   * Looks for folder with the given path, creates if it does not exist
   * @param {string} folder - The Site Collection Relative path to the folder
   */
  findOrMakeFolder(folder: string) {
    //if (folder[0] === '/') {
    //  folder = folder.substr(1);
    //}
    return this.findFolder(folder).mergeMap(result => {
      if (result.error || !!result.body.error) {
        console.log(`Can't find this folder, I'm going to make it!`);
        return this.createFolder(folder);
      }
      console.log(`Folder exists, noting to see here...`);
      return Observable.empty();
    });
  }

  /**
   * Finds folders returns folder or error
   * @param {string} folder - The Site Collection Relative path to the folder
   */
  private findFolder(folder: string) {
    this.REQ_OPTIONS.url = `${Config.SP_ROOT}/_api/web/getfolderbyserverrelativeurl('${folder}')`;
    return request.sendRequest(this.REQ_OPTIONS, this.NTLM_OPTIONS);
  }

  /**
   * Creates a folder at the given path
   * @param {string} folder - The Site Collection Relative path to the folder
   */
  private createFolder(folder: string) {
    this.REQ_OPTIONS.url = `${Config.SP_ROOT}/_api/web/folders`;
    this.REQ_OPTIONS.method = 'POST';
    this.REQ_OPTIONS.json = true;
    this.REQ_OPTIONS.body = {
      '__metadata': {
        'type': 'SP.Folder'
      },
      'ServerRelativeUrl': folder
    };
    this.REQ_OPTIONS.headers = {
        'accept': 'application/json;odata=verbose',
        'content-type': 'application/json;odata=verbose',
        'content-length': JSON.stringify(this.REQ_OPTIONS.body).length
    };
    return request.sendRequest(this.REQ_OPTIONS, this.NTLM_OPTIONS);
  }
}
