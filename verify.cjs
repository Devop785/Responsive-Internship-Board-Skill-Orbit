const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync('script.js', 'utf8');
function setup(value, blocked = false) {
  const nodes = new Map();
  const node = key => {
    if (!nodes.has(key)) nodes.set(key, {value:'',hidden:true,textContent:'',innerHTML:'',dataset:{},classList:{add(){},remove(){},toggle(){}},setAttribute(){},addEventListener(){},querySelector(){return null},focus(){},open:false});
    return nodes.get(key);
  };
  const context = vm.createContext({document:{querySelector:node,querySelectorAll:()=>[]},localStorage:{getItem(){if(blocked)throw Error('blocked');return value;},setItem(k,v){if(blocked)throw Error('quota');value=v;}},setTimeout(){},clearTimeout(){}});
  vm.runInContext(source,context);
  return {context,node,run:s=>vm.runInContext(s,context)};
}
for (const bad of ['{','{}','null','["1"]']) {
  const t=setup(bad);assert.equal(t.node('#storage-error').hidden,false);assert.match(t.node('#results-count').textContent,/6 of 6/);
}
const blocked=setup(null,true);blocked.run('toggleSaved(1)');assert.equal(blocked.run('savedIds.has(1)'),true);assert.equal(blocked.node('#storage-error').hidden,false);
const valid=setup('[1,999]');assert.equal(valid.run('savedIds.size'),1);valid.node('#search-input').value='python';assert.equal(valid.run('getFilteredInternships().length'),3);valid.run('setCategory("Design")');assert.equal(valid.node('#empty-state').hidden,false);valid.run('clearFilters()');assert.equal(valid.node('#empty-state').hidden,true);valid.run('toggleSaved(2)');assert.equal(valid.run('savedIds.has(2)'),true);
console.log('PASS: invalid JSON/schema, blocked storage, stale IDs, search, combined filters, empty state, reset and saving');
