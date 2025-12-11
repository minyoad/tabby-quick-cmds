@echo off
SETLOCAL

REM Ensure we are in the correct directory
pushd "%~dp0" || (
    echo Error: Could not change to script directory
    EXIT /B 1
)

REM 1. Set version number
REM Read current version from package.json
echo Reading version from package.json...
FOR /F "tokens=*" %%i IN ('node -p "require('./package.json').version" 2^>NUL') DO SET "CURRENT_VERSION=%%i"
IF "%CURRENT_VERSION%"=="" (
    call :error_exit "Could not read current version from package.json"
)
echo Current version is %CURRENT_VERSION%

REM Get new version from user
:get_version
SET /P NEW_VERSION="Enter new version (current: %CURRENT_VERSION%): "
IF "%NEW_VERSION%"=="" (
    echo Version cannot be empty
    goto get_version
)

REM Update version in package.json
node -e "const fs = require('fs'); const pkg = require('./package.json'); pkg.version = '%NEW_VERSION%'; try { fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2) + '\n'); } catch (e) { process.exit(1); }"
IF ERRORLEVEL 1 (
    call :error_exit "Could not update package.json version"
)
echo Version updated to %NEW_VERSION% in package.json

REM 2. Commit to Git
git add package.json
git commit -m "Release v%NEW_VERSION%"
git tag "v%NEW_VERSION%"
IF ERRORLEVEL 1 (
    call :error_exit "Could not create git tag"
)
git push --tags
git push 

echo Git changes committed with tag v%NEW_VERSION%

@REM REM 3. Optional npm publish
@REM choice /c YN /m "Publish to npm (Y/N)? "
@REM IF ERRORLEVEL 2 (
@REM     echo Skipping npm publish
@REM ) ELSE (
@REM     npm publish
@REM     IF ERRORLEVEL 1 (
@REM         call :error_exit "npm publish failed"
@REM     )
@REM     echo Package published to npm
@REM )

REM Create zip file
echo Creating zip package...
yarn pub
IF ERRORLEVEL 1 (
    call :error_exit "Could not create zip file"
)

echo Deployment script finished successfully!
popd
ENDLOCAL
EXIT /B 0

REM Function to display error and exit - moved to the end as requested
:error_exit
    echo Error: %1
    popd
    ENDLOCAL
    EXIT /B 1
