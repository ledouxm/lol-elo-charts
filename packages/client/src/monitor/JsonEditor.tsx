import { JsonEditor as Editor } from "jsoneditor-react";
import "jsoneditor-react/es/editor.min.css";

export const JsonEditor = ({ value, onChange, mode = "edit" }) => {
    return <Editor value={value} onChange={onChange} {...(mode === "edit" ? editProps : viewProps)} />;
};
const editProps = { allowedModes: [Editor.modes.tree, Editor.modes.code], history: true, enableTransform: false };

const viewProps = {
    mode: Editor.modes.view,
    allowedModes: [Editor.modes.view, Editor.modes.code],
    enableTransform: false,
};
