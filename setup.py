from setuptools import setup, find_packages

setup(
    name='porfolio',
    version='1.0.0',
    packages=find_packages('src'),
    package_dir={'': 'src'},
    url='https://github.com/kkawabat/portfolio',
    license='MIT',
    author='Kan Kawabata',
    author_email='kkawabat@asu.edu',
    description='Utility functions used to generate magic eye images',
    install_requires=[]
)
