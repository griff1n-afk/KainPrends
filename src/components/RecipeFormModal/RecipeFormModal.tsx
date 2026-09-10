import './RecipeFormModal.css'
import BasicsSection from './sections/BasicsSection';
import PhotoUpload from './sections/PhotoUpload';
import IngredientsSection from './sections/IngredientsSection';
import StepsSection from './sections/StepsSection';
import NotesSection from './sections/NotesSection';
import { useIsMobile } from '../../hooks/useIsMobile';

import { supabase } from '../../supabaseClient';
import { useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';

interface RecipeFormModalProps {
  onClose: () => void;
  userId: string;
  onRecipeAdded: () => void;
  editRecipeId?: string;
}

interface Ingredient {
  id: string;
  text: string;
}

interface Step {
  id: string;
  description: string;
}


export default function RecipeFormModal({ onClose, userId, onRecipeAdded, editRecipeId   }: RecipeFormModalProps) {

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, []);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'ingredients' | 'steps'>('ingredients');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [title, setTitle] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');

  const [notes, setNotes] = useState('');

  const handlePhotoSelect = (file: File) => {
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const uploadPhoto = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `recipe-photos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('recipes')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Photo upload failed:', uploadError);
      return null;
    }

    const { data } = supabase.storage.from('recipes').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const toggleCategory = (categoryName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: crypto.randomUUID(), text: '' },
  ]);

  const addIngredient = () => {
    setIngredients((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text: '' },
    ]);
  };

  const removeIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((ing) => ing.id !== id));
  };

  const updateIngredient = (id: string, value: string) => {
    setIngredients((prev) =>
      prev.map((ing) => (ing.id === id ? { ...ing, text: value } : ing))
    );
  };

  const [steps, setSteps] = useState<Step[]>([
    { id: crypto.randomUUID(), description: '' },
  ]);

  const addStep = () => {
    setSteps((prev) => [...prev, { id: crypto.randomUUID(), description: '' }]);
  };

  const removeStep = (id: string) => {
    setSteps((prev) => prev.filter((step) => step.id !== id));
  };

  const updateStep = (id: string, value: string) => {
    setSteps((prev) =>
      prev.map((step) => (step.id === id ? { ...step, description: value } : step))
    );
  };

  const moveStep = (id: string, direction: 'up' | 'down') => {
    setSteps((prev) => {
      const index = prev.findIndex((step) => step.id === id);
      const newIndex = direction === 'up' ? index - 1 : index + 1;

      if (newIndex < 0 || newIndex >= prev.length) return prev;

      const updated = [...prev];
      [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
      return updated;
    });
  };

  const getValidIngredients = () => {
    return ingredients.filter((ing) => ing.text.trim() !== '');
  };

  const getValidSteps = () => {
    return steps.filter((step) => step.description.trim() !== '');
  };

  const [publishError, setPublishError] = useState<string | null>(null);

  const validateForm = (): string | null => {
    if (title.trim() === '') return 'Please enter a recipe title.';
    if (selectedCategories.length === 0) return 'Please select at least one category.';
    if (getValidIngredients().length === 0) return 'Please add at least one ingredient.';
    if (getValidSteps().length === 0) return 'Please add at least one step.';
    return null;
  };

  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    const error = validateForm();
    if (error) {
      setPublishError(error);
      return;
    }

    setPublishError(null);
    setIsPublishing(true);

    let photoUrl: string | null = photoPreview;
    if (photoFile) {
      photoUrl = await uploadPhoto(photoFile);
      if (!photoUrl) {
        setPublishError('Photo upload failed. Please try again.');
        setIsPublishing(false);
        return;
      }
    }

    const validIngredients = getValidIngredients().map((ing) => ing.text.trim());
    const validSteps = getValidSteps().map((step) => step.description);

    const recipePayload = {
      title: title.trim(),
      category: selectedCategories,
      prep_time: prepTime ? Number(prepTime) : null,
      cook_time: cookTime ? Number(cookTime) : null,
      servings: servings || null,
      ingredients: validIngredients,
      steps: validSteps,
      notes: notes.trim() || null,
      image_url: photoUrl,
    };

    const { error: saveError } = editRecipeId
      ? await supabase.from('recipes').update(recipePayload).eq('id', editRecipeId)
      : await supabase.from('recipes').insert({ ...recipePayload, user_id: userId });

    setIsPublishing(false);

    if (saveError) {
      setPublishError('Something went wrong saving your recipe. Please try again.');
      console.error(saveError);
      return;
    }

    onRecipeAdded();
    onClose();
  };

  const hasUnsavedData = () => {
    return (
      title.trim() !== '' ||
      selectedCategories.length > 0 ||
      prepTime !== '' ||
      cookTime !== '' ||
      servings !== '' ||
      notes.trim() !== '' ||
      photoFile !== null ||
      ingredients.some((ing) => ing.text.trim() !== '') ||
      steps.some((step) => step.description.trim() !== '')
    );
  };

  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

const handleCloseAttempt = () => {
  if (hasUnsavedData()) {
    setShowDiscardConfirm(true);
  } else {
    onClose();
  }
};

const isMobile = useIsMobile();
const [wizardStep, setWizardStep] = useState(0);

const WIZARD_STEPS = ['basics', 'photo', 'ingredients', 'steps', 'notes'] as const;

const goNext = () => {
  setWizardStep((prev) => Math.min(prev + 1, WIZARD_STEPS.length - 1));
};

const goBack = () => {
  setWizardStep((prev) => Math.max(prev - 1, 0));
};

const [isLoadingRecipe, setIsLoadingRecipe] = useState(!!editRecipeId);

useEffect(() => {
  if (!editRecipeId) return;

  const loadRecipeForEdit = async () => {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', editRecipeId)
      .single();

    if (error || !data) {
      console.error('Failed to load recipe for editing:', error);
      setIsLoadingRecipe(false);
      return;
    }

    setTitle(data.title ?? '');
    setSelectedCategories(data.category ?? []);
    setPrepTime(data.prep_time != null ? String(data.prep_time) : '');
    setCookTime(data.cook_time != null ? String(data.cook_time) : '');
    setServings(data.servings ?? '');
    setNotes(data.notes ?? '');
    setPhotoPreview(data.image_url ?? null);

    setIngredients(
      (data.ingredients ?? []).map((ingredientString: string) => ({
        id: crypto.randomUUID(),
        text: ingredientString,
      }))
    );

    setSteps(
      (data.steps ?? []).map((description: string) => ({
        id: crypto.randomUUID(),
        description,
      }))
    );
    setIsLoadingRecipe(false);
  };

  loadRecipeForEdit();
}, [editRecipeId]);

const renderMobileStep = () => {
  switch (WIZARD_STEPS[wizardStep]) {
    case 'basics':
      return (
        <BasicsSection
          selectedCategories={selectedCategories}
          onToggleCategory={toggleCategory}
          title={title}
          onTitleChange={setTitle}
          prepTime={prepTime}
          onPrepTimeChange={setPrepTime}
          cookTime={cookTime}
          onCookTimeChange={setCookTime}
          servings={servings}
          onServingsChange={setServings}
        />
      );
    case 'photo':
      return <PhotoUpload photoPreview={photoPreview} onPhotoSelect={handlePhotoSelect} />;
    case 'ingredients':
      return (
        <IngredientsSection
          ingredients={ingredients}
          onAdd={addIngredient}
          onRemove={removeIngredient}
          onUpdate={updateIngredient}
        />
      );
    case 'steps':
      return (
        <StepsSection
          steps={steps}
          onAdd={addStep}
          onRemove={removeStep}
          onUpdate={updateStep}
          onMove={moveStep}
        />
      );
    case 'notes':
      return <NotesSection notes={notes} onNotesChange={setNotes} />;
    default:
      return null;
  }
};

const WIZARD_STEP_LABELS: Record<typeof WIZARD_STEPS[number], string> = {
  basics: 'Basic Details',
  photo: 'Recipe Photo',
  ingredients: 'Ingredients',
  steps: 'Steps',
  notes: 'Notes & Tips',
};

  return (
    <>
      <div className="arm-overlay">
        <div className="arm-card">
          <div className="arm-header">
            <h2>{editRecipeId ? 'Edit Recipe' : 'Create New Recipe'}</h2>
            <button className="arm-close-btn" onClick={handleCloseAttempt}>&times;</button>
          </div>

          {isLoadingRecipe ? (
            <div className="arm-loading">
              <span>Loading recipe...</span>
            </div>
          ) : isMobile ? (
            <div className="arm-wizard">
              <div className="arm-wizard-progress">
                {WIZARD_STEPS.map((step, index) => (
                  <div
                    key={step}
                    className={`arm-wizard-dot ${index === wizardStep ? 'active' : ''} ${index < wizardStep ? 'completed' : ''}`}
                  />
                ))}
              </div>
              <h3 className="arm-wizard-step-title">{WIZARD_STEP_LABELS[WIZARD_STEPS[wizardStep]]}</h3>
              <div className="arm-wizard-content">
                {renderMobileStep()}
              </div>

              <div className="arm-wizard-nav">
                {wizardStep > 0 && (
                  <button type="button" className="arm-cancel-btn" onClick={goBack}>
                    Back
                  </button>
                )}
                {wizardStep < WIZARD_STEPS.length - 1 ? (
                  <button type="button" className="arm-publish-btn" onClick={goNext}>
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    className="arm-publish-btn"
                    onClick={handlePublish}
                    disabled={isPublishing}
                  >
                    {isPublishing ? 'Publishing...' : 'Publish Recipe'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="arm-body">
              <div className="arm-left-column">
                <PhotoUpload photoPreview={photoPreview} onPhotoSelect={handlePhotoSelect}/>
                <BasicsSection
                  selectedCategories={selectedCategories}
                  onToggleCategory={toggleCategory}
                  title={title}
                  onTitleChange={setTitle}
                  prepTime={prepTime}
                  onPrepTimeChange={setPrepTime}
                  cookTime={cookTime}
                  onCookTimeChange={setCookTime}
                  servings={servings}
                  onServingsChange={setServings}
                />
                <NotesSection notes={notes} onNotesChange={setNotes} />
              </div>

              <div className="arm-right-column">
                <div className="arm-tabs">
                  <button
                  type="button"
                  className={`arm-tab ${activeTab === 'ingredients' ? 'active' : ''}`}
                  onClick={() => setActiveTab('ingredients')}
                >
                  Ingredients
                </button>
                <button
                  type="button"
                  className={`arm-tab ${activeTab === 'steps' ? 'active' : ''}`}
                  onClick={() => setActiveTab('steps')}
                >
                  Steps
                </button>
                </div>

                <div className="arm-tab-content">
                  {activeTab === 'ingredients' ? <IngredientsSection
                                                  ingredients={ingredients}
                                                  onAdd={addIngredient}
                                                  onRemove={removeIngredient}
                                                  onUpdate={updateIngredient}
                                                  /> : <StepsSection 
                                                        steps={steps}
                                                        onAdd={addStep}
                                                        onRemove={removeStep}
                                                        onUpdate={updateStep}
                                                        onMove={moveStep}
                                                        />}
                </div>
              </div>
            </div>
          )}

          {publishError&& !isLoadingRecipe && (
            <div className="arm-error-banner">
              <AlertCircle size={18} className="arm-error-banner-icon" />
              <span>{publishError}</span>
              <button
                type="button"
                className="arm-error-close-btn"
                onClick={() => setPublishError(null)}
              >
                <X size={16} />
              </button>
            </div>
          )}
          {!isMobile && (
            <div className="arm-footer">
              <button className="arm-cancel-btn" onClick={handleCloseAttempt}>Cancel</button>
              <button
                type="button"
                className="arm-publish-btn"
                onClick={handlePublish}
                disabled={isPublishing}
              >
                {isPublishing ? 'Publishing...' : 'Publish Recipe'}
              </button>
            </div>
          )}
        </div>
      </div>
      
      {showDiscardConfirm && (
        <div className="arm-confirm-overlay">
          <div className="arm-confirm-card">
            <h3>Discard this recipe?</h3>
            <p>You have unsaved changes. If you close now, everything you've entered will be lost.</p>
            <div className="arm-confirm-actions">
              <button
                type="button"
                className="arm-cancel-btn"
                onClick={() => setShowDiscardConfirm(false)}
              >
                Keep Editing
              </button>
              <button
                type="button"
                className="arm-confirm-discard-btn"
                onClick={onClose}
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}