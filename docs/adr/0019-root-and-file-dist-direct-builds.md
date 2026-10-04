# Root and File-Dist Direct Builds

The direct-file build writes both the root index.html for obvious double-click launch and file-dist/ as the generated artifact directory. Supporting both paths prevents the common failure where the tested generated page works but the file a player naturally opens still points at development-only modules.
