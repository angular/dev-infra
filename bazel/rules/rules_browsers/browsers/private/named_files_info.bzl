"""Implementation of NamedFilesInfo provider."""

NamedFilesInfo = provider(
    doc = "Provider exposing the named files of an extracted browser archive.",
    fields = {
        "value": "Dictionary of keys and their corresponding manifest paths",
    },
)
