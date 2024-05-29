## devops readme 
In case I ever forget my devops here are some common things I don't want to forget

### how to setup a new server
I should have taken better notes for this... I mainly followed this tutorial [here](https://www.digitalocean.com/community/tutorials/how-to-set-up-django-with-postgres-nginx-and-gunicorn-on-ubuntu-18-04#step-6-testing-gunicorn-s-ability-to-serve-the-project) with debugging along the way.

### how to create new app
- create new folder with your app name (<APPNAME>) in apps directory then run the below command to create an app using the `_app_template`

```commandline
make startapp app_name=<APPNAME>
```

Additional changes needed to be made to custom templates 
- update names in project's `urls.py` to Kebab case
- update `template/index.html`
- add `APPNAME` to global `urls.py` 
- add app to `project` in `admin` panel
  - `http://127.0.0.1:8000/admin` 
- add app to INSTALLED_APPS in `settings.py`


### how to update production

- push code to GitHub locally `git push`
- ssh connect to the production server (hint `ssh XXXXXX@kankawabata.com`)
- navigate to $HOME/projects/portfolio on the server
- run `poetry shell`
- run `bash devops/update_prod.sh` this script: 
  - pulls latest change from GitHub
  - update any python packages that's changed
  - collect any static files that might have changed
- run `sudo devops/restart_services.sh` which:
  - restart the nginx server
  - restart the gunicorn server
  - restart the daphine server

