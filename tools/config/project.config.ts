import { join } from 'path';

import { SharePointConfig } from './sp.config';

/**
 * This class extends the basic configuration, and allows for project specific overrides. Examples below
 */
export class ProjectConfig extends SharePointConfig {

  PROJECT_TASKS_DIR = join(process.cwd(), this.TOOLS_DIR, 'tasks', 'project');

  constructor() {
    super();    

    // Add 'NPM' third party libs to be injected/bundled
    this.NPM_DEPENDENCIES = [
      ...this.NPM_DEPENDENCIES,
      //{ src: 'jquery/dist/jquery.min.js', inject: 'libs' },
      //{ src: 'lodash/ladash.min.js', inject: 'libs' }
    ];

    // Add `local` third-party libraries to be injected/bundled.
    this.APP_ASSETS = [
      ...this.APP_ASSETS,
      // {src: `${this.APP_SRC}/your-path-to-lib/libs/jquery-ui.js`, inject: true, vendor: false}
      // {src: `${this.CSS_SRC}/path-to-lib/test-lib.css`, inject: true, vendor: false},
    ];
  }
}