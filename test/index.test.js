const dirReader = require('../dist/index.js');

describe('dirReader test', () => {
    test('read non-existent dir', () => {
        let options = {
            dirName: ['testsrc']
        }
        expect(dirReader(options)).rejects.toThrow();
    });
    test('read all dir in root path, get .ts file', () => {
        let options = {
            extName: ['.ts']
        }
        return dirReader(options).then((files) => {
            expect(files.length).toBe(1);
            expect(files).toEqual(['src/index.ts']);
        })
    })
    test('read src and dist dir, get .ts file', () => {
        let options = {
            dirName: ['src', 'dist'],
            extName: ['.ts']
        }
        return dirReader(options).then((files) => {
            expect(files.length).toBe(1);
            expect(files).toEqual(['src/index.ts']);
        })
    });
    test('read src and dist dir, get all file', () => {
        let options = {
            dirName: ['src', 'dist'],
            extName: []
        }
        return dirReader(options).then((files) => {
            expect(files.length).toBe(2);
            expect(files).toEqual(['src/index.ts', 'dist/index.js']);
        })
    });
});