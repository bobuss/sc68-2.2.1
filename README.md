# webAudio68

Copyright (C) 2023 Bertrand Tornil

Original work by Juergen Wothke (https://bitbucket.org/wothke/sc68-2.2.1/src/master/)


## How to build

The worklet code is built as a single file (including ASM part).


### Using docker
```shell
docker run \
  --rm \
  -v $(pwd):/src \
  -u $(id -u):$(id -g) \
  emscripten/emsdk \
  ./makeEmscripten.sh
```

Target js file is `dist/sc68_worklet_processor.js`



### Using a local emscripten
You'll need Emscripten (https://emscripten.org/docs/getting_started/downloads.html).

Then type
```shell
./makeEmscripten.sh
```

Target js file is `dist/sc68_worklet_processor.js`


## How to use

... TODO ...



## License
This program (i.e web extensions of sc68) is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public
License as published by the Free Software Foundation, either version 3 of
the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
