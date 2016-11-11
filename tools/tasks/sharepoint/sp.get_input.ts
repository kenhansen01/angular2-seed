import Config from '../../config';

const inquirer = require('inquirer');

export = (done: any) => {

  function getUserInfo(done: any) {
    let questions: Object[] = [
      {
        type: 'confirm',
        name: 'confirm_sproot',
        message: `Just checking, is your sharepoint root url: ${Config.SP_ROOT}?`,
        when: !!Config.SP_ROOT
      },
      {
        type: 'input',
        name: 'sproot',
        message: `Enter your SharePoint root url with protocol (http:// or https://): `,
        when: (answers: any): boolean => {
          return !Config.SP_ROOT ? true : !answers.confirm_sproot;
        }
      },
      {
        type: 'confirm',
        name: 'confirm_user',
        message: `Just checking, is your username ${Config.USER_NAME}?`,
        when: !!Config.USER_NAME
      },
      {
        type: 'input',
        name: 'username',
        message: `Enter your SharePoint username: `,
        when: (answers: any): boolean => {
          return !Config.USER_NAME ? true : !answers.confirm_user;
        }
      },
      {
        type: 'confirm',
        name: 'confirm_pass',
        message: `Do you want to reenter your password?`,
        when: !!Config.USER_NAME && !!Config.USER_PASSWORD
      },
      {
        type: 'password',
        name: 'password',
        message: `Enter your SharePoint password: `,
        when: (answers: any): boolean => {
          return !Config.USER_PASSWORD ? true : !answers.confirm_pass;
        }
      },
      {
        type: 'confirm',
        name: 'confirm_domain',
        message: `Is your domain ${Config.USER_DOMAIN}?`,
      },
      {
        type: 'input',
        name: 'domain',
        message: `Enter your SharePoint domain: `,
        when: (answers: any): boolean => {
          return !answers.confirm_domain;
        },
        default: 'corporate'
      },
      {
        type: 'checkbox',
        name: 'collection_select',
        message: 'Select the site collection(s) to modify',
        choices: () => {
          let siteColls: string[] = ['all'];
          Config.SP_COLLECTIONS.forEach((coll) => {
            siteColls.push(coll.name);
          });
          return siteColls;
        },
        when: Config.SELECTED_COLLECTIONS === null
      }

    ];
    inquirer.prompt(questions)
      .then((answers: any) => {
        Config.SP_ROOT = answers.sproot || Config.SP_ROOT;
        Config.USER_NAME = answers.username || Config.USER_NAME;
        Config.USER_PASSWORD = answers.password || Config.USER_PASSWORD;
        Config.USER_DOMAIN = answers.domain || Config.USER_DOMAIN;
        Config.SELECTED_COLLECTIONS = (() => {
          return Config.SELECTED_COLLECTIONS !== null ? Config.SELECTED_COLLECTIONS : Config.SP_COLLECTIONS.filter((collection) => {
            return answers.collection_select.forEach((selected: string) => {
              return selected === 'all' ? true : selected === collection.name;
            });
          });
        })();
        return done();
      });
  }
  return getUserInfo(done);
};
