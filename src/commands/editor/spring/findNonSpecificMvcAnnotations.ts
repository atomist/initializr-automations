import { JavaFileParser } from "@atomist/antlr/tree/ast/antlr/java/JavaFileParser";
import { HandleCommand } from "@atomist/automation-client";
import { BaseEditorOrReviewerParameters } from "@atomist/automation-client/operations/common/params/BaseEditorOrReviewerParameters";
import { MappedRepoParameters } from "@atomist/automation-client/operations/common/params/MappedRepoParameters";
import { SourceLocation } from "@atomist/automation-client/operations/common/SourceLocation";
import { reviewerHandler, ReviewRouter } from "@atomist/automation-client/operations/review/reviewerToCommand";
import { ProjectReview, ReviewComment, Severity } from "@atomist/automation-client/operations/review/ReviewResult";
import { Project } from "@atomist/automation-client/project/Project";
import { findMatches } from "@atomist/automation-client/tree/ast/astUtils";
import { JavaSourceFiles } from "../../generator/java/javaProjectUtils";
import { MessagingReviewRouter } from "../../messagingReviewRouter";
import { SpringBootReviewerTags } from "./springConstants";

export class NonSpecificMvcAnnotation implements ReviewComment {

    public severity: Severity = "info";
    public category = "Old style MVC annotation";

    constructor(public raw: string, public sourceLocation: SourceLocation) {
    }

    get detail() {
        return `Old style Spring MVC \`@RequestAnnotation\`: Use specific mapping`;
    }
}

const RequestMappingAnnotation = `//annotation[//annotationName[@value='RequestMapping']]`;

/**
 * Find all non specific, old style @RequestMapping annotations
 * @param {Project} p project to search
 * @param {string} globPattern glob pattern, defaults to standard Maven
 * location of source tree.
 */
export function findNonSpecificMvcAnnotations(p: Project,
                                              globPattern: string = JavaSourceFiles): Promise<ProjectReview> {
    return findMatches(p, JavaFileParser, globPattern, RequestMappingAnnotation)
        .then(fileHits => ({
            repoId: p.id,
            comments: fileHits.map(m => new NonSpecificMvcAnnotation(
                m.$value,
                m.sourceLocation)),
        }));
}

export function findNonSpecificMvcAnnotationsCommand(reviewRouter: ReviewRouter<any> = MessagingReviewRouter): HandleCommand {
    return reviewerHandler(() => p => findNonSpecificMvcAnnotations(p),
        BaseEditorOrReviewerParameters,
        "FindNonSpecificMvcAnnotations",
        {
            tags: SpringBootReviewerTags,
            intent: "review mvc",
            reviewRouter,
        },
    );
}
