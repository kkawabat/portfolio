## devops readme 
In case I ever forget my devops here are some common things I don't want to forget

### how to setup a new server
I should have taken better notes for this... I mainly followed this tutorial [here](https://www.digitalocean.com/community/tutorials/how-to-set-up-django-with-postgres-nginx-and-gunicorn-on-ubuntu-18-04#step-6-testing-gunicorn-s-ability-to-serve-the-project) 
and [here]() 


### how to create new app
create new folder with your app name (<APPNAME>) in apps directory then run the below command to create an app using the `_app_template`

```commandline
python manage.py startapp --template=apps/_app_template <APPNAME> apps/<APPNAME>
```

### how to update production

- push code to Github locally `git push`
- ssh connect to the production server
- navigate to $HOME/projects/portfolio on the server
- run `poetry shell`
- run `bash devops/update_prod.sh` this script: 
  - pulls latest change from Github
  - update any python packages that's changed
  - collect any static files that might have changed
- run `sudo devops/restart_services.sh` this script:
  - restart the nginx server
  - restart the gunicorn server
  - restart the daphine server

