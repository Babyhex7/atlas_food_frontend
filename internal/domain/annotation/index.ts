// Domain Annotation — Food Annotation CMS (admin) + viewer published (responden)

export { AnnotationList } from "./components/AnnotationList";
export { AnnotationUploader } from "./components/AnnotationUploader";
export { AnnotationEditor } from "./components/AnnotationEditor";
export { AnnotationPreview } from "./components/AnnotationPreview";
export { AnnotatedFoodViewer } from "./components/AnnotatedFoodViewer";

export {
  useAnnotationList,
  useAnnotationDetail,
  usePublishedAnnotation,
  usePublishedAnnotationsByFood,
  annotationKeys,
} from "./hooks/useAnnotationQueries";

export { useAnnotationEditorStore } from "./store/annotationEditorStore";

export type {
  AnnotationStatus,
  AreaInput,
  DraftArea,
  FoodArea,
  FoodImage,
  FoodImageSummary,
  Point,
} from "./types/annotation";
