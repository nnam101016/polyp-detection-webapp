#check if those lib are installed, if not install them then run the streamlit app

INSTALLED_LIBS := $(shell pip list --format=freeze)
# get installed libraries in the host computer in freeze format
REQUIRED_LIBS := $(shell type .\endo_backend\requirements.txt) 
# list of required libraries, add more as needed
NEEDED_LIBS = $(foreach lib,$(REQUIRED_LIBS),$(if $(findstring $(lib),$(INSTALLED_LIBS)),,$(lib)))
# list of required libraries that are not installed

all: #listed down all needed libraries
	@echo Write down all needed installed python libraries
	@echo $(NEEDED_LIBS)

install: #install the missing libraries 
	 @if "%NEEDED_LIBS%"=="" ( \
        @echo All required libraries are already installed. \
    ) else ( \
        @echo Installing missing libraries: $(NEEDED_LIBS) \
        && pip install $(NEEDED_LIBS) \
    )

run_react: install #run the app after installing the missing libraries
	@echo Opening React app...
	cd endo_frontend && npm start
	
bundle_react: 
	@echo Bundling React app...
	cd endo_frontend && npm run build
	@echo React app bundled successfully.

#streamlit run Main.py	--- prototyping layout
