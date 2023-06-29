echo """
build --repository_cache=~/.cache/bazel_repo_cache
""" >> $BAZELRC_PATH


cat $BAZELRC_PATH