import { parse } from 'url';
import * as gulp from 'gulp';
import * as util from 'gulp-util';
import { writeFileSync } from 'fs';

import Config from '../../config';
import { FindOrCreateFolders } from '../../utils';

const getFolder = new FindOrCreateFolders();
const folder = `${Config.SP_DEST_DIR}/test`;

export = (done: any) => {
  return getFolder.findOrMakeFolder(folder).subscribe(res => {
    console.log(res.body);
  })
}