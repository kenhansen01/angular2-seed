import { join } from 'path';
import { argv } from 'yargs';

import { SeedConfig } from './seed.config';

export class SharePointConfig extends SeedConfig {

  CUSTOM_CONFIG = require(join(process.cwd(), this.APP_SRC, 'tools', 'config', 'custom.config.json'));

  SP_FILE_NAME = this.CUSTOM_CONFIG.filename;

  SP_DEST_DIR = '/_catalogs/masterpage/custom';

  SP_TASKS_DIR = join(process.cwd(), this.TOOLS_DIR, 'tasks', 'sharepoint');

  /**
   * User name. Can be provided with '--user' flag or with response to console prompt.
   */
  USER_NAME: string = argv['user'] || null;

  /**
   * User password. Use flag '--pass' or console prompt
   */
  USER_PASSWORD: string = argv['pass'] || null;

  /**
   * User domain. Use flag '--domain' or console prompt, default is 'corporate'
   */
  USER_DOMAIN: string = argv['domain'] || 'corporate';

  /**
   * SharePoint root site collection.
   */
  SP_ROOT = argv['sproot'] || 'https://google.com';

  /**
   * SharePoint root site collection.
   */
  SP_STARTER_MASTER = '/_catalogs/masterpage/startermaster.html';

  /**
   * SharePoint Collections Available to upload to.
   */
  SP_COLLECTIONS = [
    {
      name: 'root', url: this.SP_ROOT, customize: true
    },
    {
      name: 'teams', url: `${this.SP_ROOT}/sites/teams`, customize: true
    },
    {
      name: 'training', url: `${this.SP_ROOT}/sites/training`, customize: true
    },
    {
      name: 'sales', url: `${this.SP_ROOT}/teams/sales`, customize: true
    },
    {
      name: 'coe', url: `${this.SP_ROOT}/teams/coe`, customize: true
    },
    {
      name: 'corporate', url: `${this.SP_ROOT}/sites/corporate`, customize: true
    }
  ];

  /**
   * Selected collections. Defaults to 'all' (SP_COLLECTIONS) can be changed in console.
   */
  SELECTED_COLLECTIONS = argv['selectcoll'] || null;

  constructor() {
    super();

    this.APP_TITLE = this.CUSTOM_CONFIG.title;

  }
}
