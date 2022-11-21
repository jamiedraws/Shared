declare global {
    interface Window {
        _surveyEngine: any;
        postOrderSurvey: any;
    }
}

export default class SurveyTemplatePopup implements ISurveyTemplate {
    public criteria;

    public responses;

    public templates;

    private static context: WeakMap<SurveyTemplatePopup, ISurveyTemplate> =
        new WeakMap();

    constructor(context: ISurveyTemplate) {
        SurveyTemplatePopup.context.set(this, context);

        this.criteria = context.criteria;
        this.responses = context.responses;
        this.templates = context.templates;
    }

    public addCriterion(id: string, predicate: SurveyTemplatePredicate) {
        const context = SurveyTemplatePopup.context.get(this);

        context?.addCriterion(id, predicate);
    }

    public addResponse(id: string, response: Record<string, {}>) {
        const context = SurveyTemplatePopup.context.get(this);

        context?.addResponse(id, response);
    }

    public addTemplate(id: string, template: string) {
        const context = SurveyTemplatePopup.context.get(this);

        context?.addTemplate(id, template);

        window.postOrderSurvey.addTemplate(
            id,
            $(`[data-survey-popup-template-id="${id}"]`),
            false
        );
    }

    public getCriterionResult() {
        const context = SurveyTemplatePopup.context.get(this);

        return context?.getCriterionResult();
    }

    public getResponseByResult() {
        const context = SurveyTemplatePopup.context.get(this);

        return context?.getResponseByResult();
    }

    public getTemplateByResult() {
        const context = SurveyTemplatePopup.context.get(this);

        return context?.getTemplateByResult();
    }

    public getResults() {
        const context = SurveyTemplatePopup.context.get(this);
        let results = context?.getResults() ?? {};

        window._surveyEngine.postSubmit = () => {
            results = context?.getResults() ?? results;

            const id = results.criterion?.id ?? "response";
            const response = results.response ??
                context?.responses.response ?? {
                    id: "success",
                    title: "Thank you for your response.",
                    close: true
                };

            window.postOrderSurvey
                .addResponse({
                    addTemplate: window.postOrderSurvey.template[id],
                    addResponse: response
                })
                .then(() => {
                    window.postOrderSurvey.displayModal(
                        window.postOrderSurvey.select.survey,
                        false
                    );

                    setTimeout(function () {
                        window.postOrderSurvey.displayModal(
                            window.postOrderSurvey.select.loader,
                            false
                        );

                        window.postOrderSurvey.displayModal(
                            window.postOrderSurvey.select.success,
                            true
                        );
                    }, 1500);
                });
        };

        return results;
    }
}
