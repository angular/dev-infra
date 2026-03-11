import 'dart:convert';
import 'dart:io';
import 'package:path/path.dart' as p;
import 'package:sprintf/sprintf.dart';

import 'package:sass/src/executable/concurrent.dart';
import 'package:sass/src/executable/options.dart';
import 'package:sass_api/sass_api.dart';
import 'package:sass/src/stylesheet_graph.dart';

void main(List<String> arguments) async {
  try {
    var mappingsFile = arguments[0];
    var sassArgs = arguments.sublist(1);
    var opts = ExecutableOptions.parse(sassArgs);

    var graph = StylesheetGraph(
      ImportCache(
        importers: [
          new ModuleMappingImporter(await File(mappingsFile).readAsString()),
          ...opts.pkgImporters,
          FilesystemImporter.noLoadPath,
        ],
        loadPaths: opts.loadPaths,
      ),
    );

    if (!(await compileStylesheets(opts, graph, opts.sourcesToDestinations))) {
      exitCode = 1;
    }
  } on UsageException catch (error) {
    print("${error.message}\n");
    print(ExecutableOptions.usage);
    exitCode = 1;
  } catch (error, stackTrace) {
    print(error);
    print(stackTrace);
    exitCode = 1;
  }
}

final class ModuleMappingImporter extends Importer {
  Map<String, dynamic> mappings = new Map();
  List<String>? sortedMappings;

  ModuleMappingImporter(String mappingsFileContents) {
    this.mappings = jsonDecode(mappingsFileContents);
    // Sort to have longest mappings first.
    this.sortedMappings =
        this.mappings.keys.toList()..sort((a, b) => b.length - a.length);
  }

  @override
  Uri? canonicalize(Uri url) {
    if (url.scheme == 'file')
      return FilesystemImporter.noLoadPath.canonicalize(url);
    ;

    final match = this._matchingMapping(url.toString());
    if (match == null) {
      return FilesystemImporter.noLoadPath.canonicalize(url);
    }

    final rest = url.toString().substring(match.length);
    final String? target = this.mappings[match];

    if (target != null) {
      url = Uri.file(p.absolute(p.normalize(sprintf("%s/%s", [target, rest]))));
      return FilesystemImporter.noLoadPath.canonicalize(url);
    }

    return FilesystemImporter.noLoadPath.canonicalize(url);
  }

  ImporterResult? load(Uri url) => FilesystemImporter.noLoadPath.load(url);
  DateTime modificationTime(Uri url) =>
      FilesystemImporter.noLoadPath.modificationTime(url);
  bool couldCanonicalize(Uri url, Uri canonicalUrl) =>
      this._matchingMapping(url.toString()) != null &&
      FilesystemImporter.noLoadPath.couldCanonicalize(url, canonicalUrl);
  bool isNonCanonicalScheme(String scheme) =>
      FilesystemImporter.noLoadPath.isNonCanonicalScheme(scheme);

  String? _matchingMapping(String str) {
    final match = this.sortedMappings?.firstWhere(
      (m) => str.startsWith(m),
      orElse: () => "",
    );
    if (match == "" || match == null) {
      return null;
    }
    return match;
  }
}
