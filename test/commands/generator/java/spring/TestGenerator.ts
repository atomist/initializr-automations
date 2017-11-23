import * as tmp from "tmp";

import * as fs from "fs-extra";

import { successOn } from "@atomist/automation-client/action/ActionResult";
import { ProjectPersister } from "@atomist/automation-client/operations/generate/generatorUtils";
import { LocalProject } from "@atomist/automation-client/project/local/LocalProject";
import { NodeFsLocalProject } from "@atomist/automation-client/project/local/NodeFsLocalProject";
import { Project } from "@atomist/automation-client/project/Project";
import { diagnosticDump } from "@atomist/automation-client/project/util/diagnosticUtils";
import { SpringBootGenerator } from "../../../../../src/commands/generator/java/spring/SpringBootGenerator";

export class TestGenerator extends SpringBootGenerator {

    get created() {
        return createdProject;
    }

    constructor() {
        super(localFilePersister);
    }

}

let createdProject: LocalProject;

const localFilePersister: ProjectPersister = (p: Project) => {
    const dir = tmp.dirSync();
    fs.removeSync(dir.name + "/" + p.name);
    return diagnosticDump("before persistence")(p)
        .then(p1 => NodeFsLocalProject.copy(p1, dir.name)
            .then(lp => {
                createdProject = lp;
                return successOn(lp);
            }));
};