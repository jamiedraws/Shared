/**
 * Argument function that may provide an element to test against. The function must return a boolean value.
 */
type SurveyTemplatePredicate = () => boolean;

/**
 * Represents an object containing an id and predicate function that will be tested against
 */
interface ISurveyTemplateCriterion {
    /**
     * Identifier that represents the predicate
     */
    id: string;
    /**
     * Argument function that returns a boolean value
     */
    predicate: SurveyTemplatePredicate;
}

/**
 * Represents an object containing a unique id and an object containing data
 */
type SurveyTemplateResponse = Record<string, {}>;

/**
 * Represents an object containing a unique id and a template string
 */
type SurveyTemplateHTML = Record<string, string>;

interface ISurveyTemplateResults {
    /**
     * Provides the criterion object that matches the met criterion
     */
    criterion?: ISurveyTemplateCriterion;
    /**
     * Provides the response object that matches the met criterion
     */
    response?: SurveyTemplateResponse;
    /**
     * Provides the template string that matches the met criterion
     */
    template?: string;
}

/**
 * Provides access to collections of criterion pairs, response object pairs and template pairs along with methods that can add and get a criterion, response and or template.
 */
interface ISurveyTemplate {
    /**
     * Collects all criterion containing id and predicate pairs
     */
    criteria: ISurveyTemplateCriterion[];
    /**
     * Collects all responses containing id and object pairs
     */
    responses: SurveyTemplateResponse;
    /**
     * Collects all templates containing id and string pairs
     */
    templates: SurveyTemplateHTML;
    /**
     * Takes an id along with a predicate method as a pair and stores it into the criterion array
     */
    addCriterion: (id: string, predicate: SurveyTemplatePredicate) => void;
    /**
     * Takes a unique id and a response data object and assigns it to the response object
     */
    addResponse: (id: string, response: Record<string, {}>) => void;
    /**
     * Takes a unique id and a template string and assigns it to the template object
     */
    addTemplate: (id: string, template: string) => void;
    /**
     * Returns a specific criterion object containing the id and predicate based on the criterion that is met
     */
    getCriterionResult: () => ISurveyTemplateCriterion | undefined;
    /**
     * Returns a specific response entry containing the id and response data object based on the criterion that is met
     */
    getResponseByResult: () => Record<string, {}> | undefined;
    /**
     * Returns a specific template entry containing the id and template string based on the criterion that is met
     */
    getTemplateByResult: () => string | undefined;
    /**
     * Returns an object containing the criterion, response and template based on the criterion that is met
     */
    getResults: () => ISurveyTemplateResults;
}
