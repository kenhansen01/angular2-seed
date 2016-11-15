import { parse } from 'url';
import * as gulp from 'gulp';
import * as util from 'gulp-util';
import { writeFileSync } from 'fs';

import Config from '../../config';
import { FindOrCreateFolders, UploadFile } from '../../utils';

const getFolder = new FindOrCreateFolders();
const getFile = new UploadFile();
const folder = `${Config.SP_DEST_DIR}/test`;

export = (done: any) => {
  return getFolder.findOrMakeFolder(folder).mergeMap(res => {
    console.log(res.body);
    return getFile.updateOrAddFile(folder);
  })
    .subscribe(fileRes => console.log('File uploaded'), err => console.log(err));
};
