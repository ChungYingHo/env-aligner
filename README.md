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
The simplest way to use this package is to call the function `envAligner()` without any arguments.  
The package will check the `.env` file and `.env.example` file as default.
```javascript
const envAligner = require('env-aligner')

envAligner()
```

We also provide some options for you to customize the check:
1. `rootDir`: The root directory of your project. Default is `process.cwd()`. And you can also use `use default` to use the default root directory.
2. `fileNames`: An object that contains the file names of what you want to check. Default is `.env` and `.env.example`.
3. `checkOptions`: An object that contains the options of what you want to check. Default we put all options as `true`.

```javascript
const rootDir = 'frontend'
const fileNames = {
  schemaName: '.env.sample',
  envName: '.env.local'
}
const checkOptions = {
  isCheckMissing: true,
  isCheckEmptyValue: true,
  isCheckExtra: false
}


envAligner(rootDir, fileNames, checkOptions)

// or you can only pass a parameter by this way
envAligner({fileNames: fileNames})
```

### Use in terminal
We also provide a command line tool for you to use. The check will use the default `.env` and `.env.example` files.
```bash
npx env-aligner
```

Also, you can use some options to customize the check:
// A table of options
| Option | Description | Default |
| --- | --- | --- |
| -s, --schema | The file name of the schema file | `.env.example` |
| -e, --env | The file name of the environment file | `.env` |
| -m, --missing | Check the missing variables | `true` |
| -n, --empty | Check the missing values | `true` |
| -x, --extra | Check the extra variables | `false` |

```bash
# Check the specified .env.sample and .env.local
npx env-aligner -s .env.sample -e .env.local

# Check the specified .env.example and default .env
npx env-aligner -s .env.example 

# Do not check missing, empty value, and extra
npx env-aligner -m false -n false -x false
```

