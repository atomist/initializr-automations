import { logger } from "@atomist/automation-client/internal/util/logger";
import { ProjectAsync } from "@atomist/automation-client/project/Project";

import { File } from "@atomist/automation-client/project/File";
import { JavaPackageDeclaration } from "../java/JavaGrammars";
import { findFileMatches } from "@atomist/automation-client/tree/ast/astUtils";
import { JavaSourceFiles } from "../java/javaProjectUtils";
import { JavaFileParser } from "@atomist/antlr/tree/ast/antlr/java/JavaFileParser";

const SpringBootAppClass = `//typeDeclaration[/classDeclaration]
                            [//annotation[@value='@SpringBootApplication']]`;

/**
 * Represents the structure of a Spring Boot project,
 * which can be inferred from its contents. Covers application class
 * and starters.
 */
export class SpringBootProjectStructure {

    /**
     * Infer the Spring project structure of the given project, if found
     * @param {ProjectAsync} p
     * @return {Promise<SpringBootProjectStructure>}
     */
    public static async inferFromJavaSource(p: ProjectAsync): Promise<SpringBootProjectStructure> {
        return findFileMatches(p, JavaFileParser, JavaSourceFiles, SpringBootAppClass)
            .then(fileHits => {
                if (fileHits.length === 0) {
                    return null;
                }
                if (fileHits.length > 1) {
                    return null;
                }
                const fh = fileHits[0];
                const packageName = JavaPackageDeclaration.firstMatch(fh.file.getContentSync());
                const appClass = fh.matches[0].$value;

                if (packageName && appClass) {
                    logger.debug("Successful Spring Boot inference on %k: packageName '%s', '%s'",
                        p.id, packageName.name, appClass);
                    return new SpringBootProjectStructure(packageName.name, appClass, fh.file)
                } else {
                    logger.debug("Unsuccessful Spring Boot inference on %k: packageName '%s', '%s'",
                        p.id, packageName.name, appClass);
                    return null;
                }
            });
    }

    /**
     * The stem of the application class. Strip "Application" if present.
     */
    public applicationClassStem = this.applicationClass.replace(/Application$/, "");

    /**
     * @param applicationPackage The package with the Spring Boot application class in it.
     * @param applicationClass Name of the application class within the given package
     * @param appClassFile path to the file containing the @SpringBootApplication annotation
     */
    constructor(public applicationPackage: string, public applicationClass: string, public appClassFile: File) {
    }

}
