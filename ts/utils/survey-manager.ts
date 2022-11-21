export default class SurveyManager {
    public survey: HTMLElement | null;

    public inputs: HTMLInputElement[] = [];

    public checkboxes: HTMLInputElement[] = [];

    public radiogroups: HTMLInputElement[] = [];

    public values: HTMLInputElement[] = [];

    constructor(survey: HTMLElement | null) {
        this.survey = survey;

        if (this.survey) {
            this.inputs = Array.from(this.survey.querySelectorAll("input"));

            this.checkboxes = this.inputs.filter(
                (input) => input.type === "checkbox"
            );

            this.radiogroups = this.inputs.filter(
                (input) => input.type === "radio"
            );

            this.values = this.inputs.filter(
                (input) => input.type !== "checkbox" && input.type !== "radio"
            );
        }
    }

    private static processAnswerByPredicateThenCheckedState<T>(
        answer: HTMLInputElement | undefined,
        predicate: T
    ): boolean {
        let result = true;

        if (!answer) return false;

        if (typeof predicate === "function") {
            result = predicate(answer);
        }

        return answer.checked && result;
    }

    public hasCheckboxAnswerById(
        id: string,
        predicate?: (answer: HTMLInputElement) => boolean
    ): boolean {
        const answer = this.checkboxes.find((checkbox) => checkbox.id === id);

        return SurveyManager.processAnswerByPredicateThenCheckedState(
            answer,
            predicate
        );
    }

    public hasRadioGroupAnswerById(
        id: string,
        predicate?: (answer: HTMLInputElement) => boolean
    ): boolean {
        const answer = this.radiogroups.find(
            (radiogroup) => radiogroup.id === id
        );

        return SurveyManager.processAnswerByPredicateThenCheckedState(
            answer,
            predicate
        );
    }

    public hasRadioGroupAnswerByName(
        name: string,
        predicate?: (answers: HTMLInputElement[]) => boolean
    ): boolean {
        const answers = this.radiogroups.filter(
            (radiogroup) => radiogroup.name === name && radiogroup.checked
        );

        return typeof predicate === "function"
            ? predicate(answers)
            : (() => {
                  return answers.length > 0;
              })();
    }

    public hasValueAnswerById(
        id: string,
        predicate?: (answer: HTMLInputElement) => boolean
    ): boolean {
        const answer = this.values.find((value) => value.id === id);

        if (!answer) return false;

        return typeof predicate === "function"
            ? predicate(answer)
            : (() => {
                  return answer.value.trim().length >= 1;
              })();
    }
}
