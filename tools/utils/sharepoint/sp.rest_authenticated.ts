import { globalAgent } from 'https';
import * as Rx from 'rxjs';

import Config from '../../config';
import { INtlmOptions, IHttpReqOptions } from './sp.rest_authenticated.interfaces';

const ntlm = require('ntlm');
const ntlmrequest = require('request').defaults({
  agentClass: require('agentkeepalive').HttpsAgent
});
const rootCas = require('ssl-root-cas').rootCas;

export class SharePointAuthenticatedRequest {

  REQ_OPTIONS: IHttpReqOptions = {
    url: `${Config.SP_ROOT}/_api/contextinfo`,
    method: 'POST',
    rejectUnauthorized: false
  };
  NTLM_OPTIONS: INtlmOptions = {
    hostname: Config.SP_ROOT.split('/')[2],
    username: Config.USER_NAME,
    password: Config.USER_PASSWORD,
    domain: Config.USER_DOMAIN,
  };

  SHARE_CHALLENGE: Rx.Observable<any>;

  constructor() {
    if (globalAgent.options.ca !== rootCas) { globalAgent.options.ca = rootCas; };
    //this.SHARE_CHALLENGE = this.challengeRequest(Config.SP_ROOT, this.NTLM_OPTIONS);
  }

  sendRequest(reqOptions?: IHttpReqOptions, ntlmOptions?: INtlmOptions) {

    let rqopts = this.REQ_OPTIONS = reqOptions || this.REQ_OPTIONS;
    let ntlmopts = this.NTLM_OPTIONS = ntlmOptions || this.NTLM_OPTIONS;

    const challenge = this.challengeRequest(Config.SP_ROOT, ntlmopts);
    const digestHeader = challenge.mergeMap(cRes => this.getXRequestDigestHeader(cRes.response))
      .do((res: any) => {
        this.REQ_OPTIONS.headers['X-RequestDigest'] = res.digestVal;
      });
    const authReq = challenge.mergeMap(cRes => this.theRequest(cRes.response));

    let deferReq: Rx.Observable<any> = Rx.Observable.defer(() => {
      if (rqopts.method !== 'GET') {
        return digestHeader.concat(authReq);
      }
      else {
        return authReq;
      }
    });
      
    return deferReq;
  }

  /**
   * Challenge request sends Type1 message to url to return the Type2 message needed to send the authorized request.
   * @param {string} rqurl - The url that the request will go to
   * @param {INtlmOptions} ntlmOpts - The login info.
   * @return {Rx.Observable} Observable with the Challenge Request
   */
  private challengeRequest(rqurl: string, ntlmOpts: INtlmOptions): Rx.Observable<any> {
    return Rx.Observable.create((subscriber: Rx.Subscriber<any>) => {
      ntlmrequest({
        url: rqurl,
        method: "GET",
        headers: {
          "Authorization": ntlm.challengeHeader(ntlmOpts.hostname, ntlmOpts.domain)
        }
      }, (err: any, res: any, body: any) => {
        subscriber.next({ error: err, response: res, body: body });
        subscriber.complete();
        })
    })
  }

  /**
   * Sends a ntlm authorized request and creates an Observable to be consumed elsewhere
   * @param {any} challengeResponse - this is the response from the Challenge Request
   * @return {Rx.Observable} An Observable of the request
   */
  private theRequest(challengeResponse: any) {
    return Rx.Observable.create((subscriber: Rx.Subscriber<any>) => {

      // Create Type3 Auth Headers to send with Request
      this.REQ_OPTIONS.headers = this.REQ_OPTIONS.headers || {};
      this.REQ_OPTIONS.headers['Authorization'] = ntlm.responseHeader(challengeResponse, this.REQ_OPTIONS.url, this.NTLM_OPTIONS.domain, this.NTLM_OPTIONS.username, this.NTLM_OPTIONS.password);

      ntlmrequest(this.REQ_OPTIONS, (err: any, res: any, body: any) => {
        //if (err) { subscriber.error({ error: err }); }
        //else { subscriber.next({error: err, response: res, body: body }); }
        subscriber.next({ error: err, response: res, body: body });
        subscriber.complete();
      });
    });
  }

  /**
   * Gets a digest value that is required for any non-GET requests
   * @param {any} challengeResponse - Response from challenge request
   * @return {Rx.Observable} Observable with contextinfo payload
   */
  private getXRequestDigestHeader(challengeResponse: any) {
    return Rx.Observable.create((subscriber: Rx.Subscriber<any>) => {
      ntlmrequest({
        url: `${Config.SP_ROOT}/_api/contextinfo`,
        method: 'POST',
        json: true,
        headers: {
          "Authorization": ntlm.responseHeader(challengeResponse, `${Config.SP_ROOT}/_api/contextinfo`, this.NTLM_OPTIONS.domain, this.NTLM_OPTIONS.username, this.NTLM_OPTIONS.password),
          "accept": "application/json;odata=verbose"
        }
      }, (err: any, res: any, body: any) => {
        subscriber.next({ error: err, challengeResponse: challengeResponse, digestVal: body.d.GetContextWebInformation.FormDigestValue });
        subscriber.complete();
        })
    })
  }
}