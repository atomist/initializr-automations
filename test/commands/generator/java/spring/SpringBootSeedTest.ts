
import { EditResult, toEditor } from "@atomist/automation-client/operations/edit/projectEditor";
import { Project } from "@atomist/automation-client/project/Project";
import "mocha";
import * as assert from "power-assert";
import {
    SpringBootGenerator,
    springBootProjectEditor,
} from "../../../../../src/commands/generator/java/spring/SpringBootGenerator";
import { GishPath, GishProject } from "./SpringBootProjectStructureTest";

const GroupId = "group";
const ArtId = "art";
const Version = "1.0.7";

describe("SpringBootSeed", () => {

    it("edits project and verifies package", done => {
        edit(GishProject).then(r => {
            assert(!r.target.findFileSync(GishPath));
            const f = r.target.findFileSync("src/main/java/com/the/smiths/MyCustom.java");
            assert(f);
            const content = f.getContentSync();
            assert(content.includes("class MyCustom"));
            done();
        }).catch(done);
    });

    it("edits project and verifies POM", done => {
        edit(GishProject).then(r => {
            assert(!r.target.findFileSync(GishPath));
            const f = r.target.findFileSync("pom.xml");
            assert(f);
            const content = f.getContentSync();
            assert(!content.includes("undefined"));
            done();
        }).catch(done);
    });

    function edit(project: Project): Promise<EditResult> {
        const sbs = new SpringBootGenerator();
        const params = sbs.freshParametersInstance();
        params.serviceClassName = "MyCustom";
        params.groupId = GroupId;
        params.version = Version;
        params.artifactId = ArtId;
        params.rootPackage = "com.the.smiths";
        const ctx = null;
        return toEditor(springBootProjectEditor(params))(project, ctx, null);
    }

});
