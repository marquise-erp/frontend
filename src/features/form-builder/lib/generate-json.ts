export const generateJson = (form: any) => {
  return {
    type: "form",
    id: form.id,
    title: form.title,
    description: form.description,
    fields: form.fields,
  };
};