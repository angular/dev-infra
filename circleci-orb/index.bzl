"""Helper rules for building CircleCI orbs with the help of Bazel."""

def nodejs_script_to_sh_script(name, output_file, bundle_file):
    """Rule that takes a NodeJS script and wraps it into a Bash script.

      This is useful for inclusion in CircleCI `run` commands in Orbs because
      there cannot be an external NodeJS script file, or direct NodeJS `run` commands.
    """
    native.genrule(
        name = name,
        srcs = [bundle_file],
        outs = [output_file],
        cmd = """
          touch $@
          echo '(cat <<"EOF" ' >> $@
          cat $< >> $@
          echo 'EOF' >> $@
          echo ') | node' >> $@
        """,
    )
