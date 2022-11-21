import CaptureElement from "Shared/ts/utils/capture-element";

/**
 * Represents the task function that will execute with access to the Braintree hosted field element that was inserted into the document.
 */
export type BraintreeCheckoutHostedFieldTask = (hostedField: Element) => void;

/**
 * Represents the event type that corresponds to the Braintree hosted field's validity state. Default for neither valid or nor invalid.
 */
export type BraintreeCheckoutHostedFieldEvent = "default" | "valid" | "invalid";

export default class BraintreeCheckout {
    /**
     * Represents the container of the payment controls that will integrate with Braintree.
     */
    public fieldset: HTMLFieldSetElement;

    /**
     * Represents a key-value pair relationship between the element id containing the Braintree hosted field and the task function that will execute.
     */
    private taskRepository: Map<string, BraintreeCheckoutHostedFieldTask> =
        new Map<string, BraintreeCheckoutHostedFieldTask>();

    /**
     * Represents a key-value pair relationship between the event name and the task function that will execute based on the Braintree hosted field's validity state.
     */
    private eventRepository: Map<
        BraintreeCheckoutHostedFieldEvent,
        BraintreeCheckoutHostedFieldTask
    > = new Map<
        BraintreeCheckoutHostedFieldEvent,
        BraintreeCheckoutHostedFieldTask
    >();

    /**
     * Represents a collection of Braintree hosted field elements
     */
    private static hostedFields: Element[] = [];

    /**
     * Takes a fieldset element, representing a container of the payment controls that will integrate with Braintree, and notifies the developer when the Braintree hosted fields have been inserted into the document.
     * @param fieldset HTMLFieldSetElement
     */
    constructor(fieldset: HTMLFieldSetElement) {
        this.fieldset = fieldset;
        if (!this.fieldset) return;

        BraintreeCheckout.captureHostedFields(this);
    }

    /**
     * Captures the fieldset element and observes for the Braintree hosted fields to insert into the document. The corresponding task function that matches the inserted Braintree hosted field by the element id will then execute back to the developer. Once all task functions have executed, the observation will be terminated.
     * @param context BraintreeCheckout
     */
    private static captureHostedFields(context: BraintreeCheckout): void {
        const captureHostedFields = new CaptureElement(context.fieldset);

        captureHostedFields.subscribe("childList", (record): void => {
            const hostedField = this.getHostedFieldFromRecord(record);
            if (!hostedField) return;

            const task = context.taskRepository.get(hostedField.id);
            if (!task) return;

            this.hostedFields.push(hostedField);
            task(hostedField);

            context.taskRepository.delete(hostedField.id);

            if (context.taskRepository.size !== 0) return;

            captureHostedFields.disconnect();

            this.validateHostedFields(context);
        });
    }

    /**
     * Takes a MutationRecord and searches the added nodes for the Braintree hosted field. Returns the hosted field element if found, otherwise undefined is returned.
     * @param record MutationRecord
     * @returns Element | undefined
     */
    private static getHostedFieldFromRecord(
        record: MutationRecord
    ): Element | undefined {
        const elements = Array.from(record.addedNodes).filter(
            (node) => node.nodeType === Node.ELEMENT_NODE
        ) as Element[];

        return elements.find(
            (element) =>
                element.classList.contains("btHostedField") && element.id !== ""
        );
    }

    /**
     * Emits the valid event that is mapped to a particular Braintree hosted field element.
     * @param hostedField Element
     * @param context BraintreeCheckout
     * @returns void
     */
    private static publishValidHostedField(
        hostedField: Element,
        context: BraintreeCheckout
    ): void {
        const task = context.eventRepository.get("valid");
        if (!task) return;

        task(hostedField);
    }

    /**
     * Emits the invalid event that is mapped to a particular Braintree hosted field element.
     * @param hostedField Element
     * @param context BraintreeCheckout
     * @returns void
     */
    private static publishInvalidHostedField(
        hostedField: Element,
        context: BraintreeCheckout
    ): void {
        const task = context.eventRepository.get("invalid");
        if (!task) return;

        task(hostedField);
    }

    /**
     * Emits the default event that is mapped to a particular Braintree hosted field element.
     * @param hostedField Element
     * @param context BraintreeCheckout
     * @returns void
     */
    private static publishDefaultHostedField(
        hostedField: Element,
        context: BraintreeCheckout
    ): void {
        const task = context.eventRepository.get("default");
        if (!task) return;

        task(hostedField);
    }

    /**
     * Iterates all hosted field elements and captures the element's attribute list and responds accordingly based on it's validity state.
     * @param context BraintreeCheckout
     */
    private static validateHostedFields(context: BraintreeCheckout): void {
        this.hostedFields.forEach((hostedField) => {
            const captureHostedField = new CaptureElement(hostedField);

            captureHostedField.subscribe("attributes", (record) => {
                if (record.attributeName !== "class") return;

                captureHostedField.disconnect();

                switch (true) {
                    case hostedField.classList.contains(
                        "braintree-hosted-fields-invalid"
                    ):
                        this.publishInvalidHostedField(hostedField, context);
                        break;

                    case hostedField.classList.contains(
                        "braintree-hosted-fields-valid"
                    ):
                        this.publishValidHostedField(hostedField, context);
                        break;
                    default:
                        this.publishDefaultHostedField(hostedField, context);
                        break;
                }

                captureHostedField.connect();
            });
        });
    }

    /**
     * Takes the id of the element containing the Braintree hosted field and establishes a task to be executed once the hosted field element is inserted into the document.
     * @param id string
     * @param task BraintreeCheckoutHostedFieldTask
     */
    public subscribe(id: string, task: BraintreeCheckoutHostedFieldTask): void {
        if (!this.taskRepository.has(id)) {
            this.taskRepository.set(id, task);
        }
    }

    /**
     * Takes the name of event, expressed either as `default`, `valid` or `invalid` and executes a task based on the Braintree hosted field's validity state.
     * @param event string
     * @param task BraintreeCheckoutHostedFieldTask
     */
    public on(
        event: BraintreeCheckoutHostedFieldEvent,
        task: BraintreeCheckoutHostedFieldTask
    ): void {
        if (!this.eventRepository.has(event)) {
            this.eventRepository.set(event, task);
        }
    }
}
