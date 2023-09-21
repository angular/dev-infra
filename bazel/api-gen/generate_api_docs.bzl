load("//bazel/api-gen/extraction:extract_api_to_json.bzl", "extract_api_to_json")
load("//bazel/api-gen/rendering:render_api_to_html.bzl", "render_api_to_html")

def generate_api_docs(name, module_name, srcs):
    """Generates API documentation reference pages for the given sources."""
    json_outfile = name + "_api.json"

    extract_api_to_json(
        name = name + "_extraction",
        module_name = module_name,
        srcs = srcs,
        output_name = json_outfile,
        visibility = ["//visibility:private"],
    )

    render_api_to_html(
        name = name,
        srcs = [json_outfile],
    )
