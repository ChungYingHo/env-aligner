# Env Aligner
This is simple tool to check if the environment variables in `.env` file are aligned with the `.env.example` file.  
In the two situations below, the tool will give you a warning and exit with code 1:
1. **Missing variables**: The `.env` file is missing some variables that are in the `.env.example` file.
2. **Missing Values**: The `.env` file has some variables that are missing values but the `.env.example` file has values for them.

And below situation will only give you a warning:
1. **Extra variables**: The `.env` file has some variables that are not in the `.env.example` file.

## How to use
All you need to do first is to install the package:
```bash
npm install env-aligner
```

### Use in your code
The simplest way to use this package is to call the function `envAligner()` without any parameters.
The package will check the `.env` file and `.env.example` file as default.
```javascript
const envAligner = require('env-aligner')

envAligner()
```

We also provide some options for you to customize the check:
1. `rootDir`: Default is `process.cwd()`. You can specify the root directory of your project.
2. `fileNames`: An object that contains the file names of what you want to check.
    - `schemaName`: The file name of the schema file. Default is `.env.example`.
    - `envName`: The file name of the environment file. Default is `.env`.
3. `checkOptions`: An object that contains the options of what you want to check.
    - `isCheckMissing`: Check the missing variables. Default is `true`.
    - `isCheckEmptyValue`: Check the missing values. Default is `true`.
    - `isCheckExtra`: Check the extra variables. Default is `true`.

```javascript
const customRootDir = '/application/frontend'
const customFileNames = {
  schemaName: '.env.sample',
  envName: '.env.local'
}
const customCheckOptions = {
  isCheckExtra: false
}


envAligner({ rootDir: customRootDir, fileNames: customFileNames, checkOptions: customCheckOptions })

// or you can only pass a parameter by this way
envAligner({fileNames: fileNames})
```

### Use in terminal
We also provide a command line tool for you to use.  
The check will use the default `.env` and `.env.example` files.
```bash
npx env-aligner
```

Also, you can use some options to customize the check:

| Option | Description | Default |
| --- | --- | --- |
| -s, --schema | The file name of the schema file | `.env.example` |
| -e, --env | The file name of the environment file | `.env` |
| -m, --missing | Check the missing variables | `true` |
| -n, --empty | Check the missing values | `true` |
| -x, --extra | Check the extra variables | `true` |

```bash
# Check the specified .env.sample and .env.local
npx env-aligner -s .env.sample -e .env.local

# Check the specified .env.example and default .env
npx env-aligner -s .env.example 

# Do not check missing, empty value, and extra
npx env-aligner -m false -n false -x false
```

