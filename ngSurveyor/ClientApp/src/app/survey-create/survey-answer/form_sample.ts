const form_template = [
    {
        "type": "label", "label": "Name",
    },
    {
        "type": "textBox", "label": "Name", "value": "Survey Name",
    },
    {
        "type": "label", "label": "Description",
    },
    {
        "type": "textBox", "label": "Description", "value": "Survey description here",
    },
    {
        "type": "label", "label": "Age",
    },
    {
        "type": "number", "label": "Age", "value": "8",
    },
    {
        "type": "label", "label": "DropList",
    },
    {
        "type": "select", "label": "DropList", "options": ["Jane Eyre", "Pride and Prejudice", "Wuthering Heights"],
    },
    {
        "type": "label", "label": "Radio",
    },
    {
        "type": "radio", "label": "Radio", "value": "radio1",
    },
    {
        "type": "radio", "label": "Radio", "value": "radio2",
    },
    {
        "type": "label", "label": "Checkbox",
    },
    {
        "type": "checkbox", "label": "Checkbox", "value": "check1",
    },
    {
        "type": "checkbox", "label": "Checkbox", "value": "check2",
    }
]

export default form_template
