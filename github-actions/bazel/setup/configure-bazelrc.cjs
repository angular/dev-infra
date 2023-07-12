(()=>{var r=(o=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(o,{get:(t,a)=>(typeof require<"u"?require:t)[a]}):o)(function(o){if(typeof require<"u")return require.apply(this,arguments);throw new Error('Dynamic require of "'+o+'" is not supported')});var e=r("os"),c=r("fs"),n=process.env.BAZELRC_PATH;if(n===void 0)throw Error("BAZELRC_PATH environment variable was not provided");var l=(0,e.cpus)().length,i=Math.floor((0,e.totalmem)()/1e6),s=`
build --repository_cache=~/.cache/bazel_repo_cache
common --local_cpu_resources=${l}
common --local_ram_resources=${i}
`;(0,c.appendFileSync)(n,s,{encoding:"utf-8"});console.log((0,c.readFileSync)(n,{encoding:"utf-8"}));})();
//# sourceMappingURL=bundle.js.map
