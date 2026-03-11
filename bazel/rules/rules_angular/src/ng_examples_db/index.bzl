load("@aspect_rules_js//js:defs.bzl", "js_run_binary")

def ng_examples_db(name, srcs, path, out, data = []):
    js_run_binary(
        name = name,
        outs = [out],
        srcs = srcs + data,
        tool = "@rules_angular//src/ng_examples_db:bin",
        progress_message = "Generating code examples database from %s" % path,
        mnemonic = "NgExamplesDb",
        args = [path, "$(rootpath %s)" % out],
    )
