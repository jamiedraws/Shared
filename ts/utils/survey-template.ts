export default class SurveyTemplate implements ISurveyTemplate {
    public criteria: ISurveyTemplateCriterion[];

    public responses: Record<string, any>;

    public templates: Record<string, string>;

    constructor() {
        this.criteria = [];
        this.responses = {};
        this.templates = {};
    }

    public addCriterion(id: string, predicate: SurveyTemplatePredicate): void {
        this.criteria.push({ id, predicate });
    }

    public addResponse(id: string, response: Record<string, {}>) {
        this.responses[id] = response;
    }

    public addTemplate(id: string, template: string) {
        this.templates[id] = template;
    }

    public getCriterionResult(): ISurveyTemplateCriterion | undefined {
        return this.criteria.find((criterion) => criterion.predicate());
    }

    public getResponseByResult(): Record<string, {}> | undefined {
        const result = this.getCriterionResult();

        if (!result) return;

        return this.responses[result.id];
    }

    public getTemplateByResult(): string | undefined {
        const result = this.getCriterionResult();

        if (!result) return;

        return this.templates[result.id];
    }

    public getResults(): ISurveyTemplateResults {
        const criterion = this.getCriterionResult();
        const id = criterion?.id ?? "";

        const template = this.templates[id];

        const response = this.responses[id];

        return { criterion, template, response };
    }
}
