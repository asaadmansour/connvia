import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import styles from "../../pages/Signup.module.css";
import HierarchicalMultiSelect from "../common/HierarchicalMultiSelect";
import {
  getCategories,
  getSubcategoriesByCategoryId,
} from "../../utils/categoryService";
import { getAllLocations } from "../../utils/locationService";

const RoleSpecificStep = ({
  formState,
  handleRoleDataChange,
  handleNextStep,
  handlePrevStep,
}) => {
  // State for attendee role
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [selectedInterests, setSelectedInterests] = useState(
    formState.roleData?.selectedInterests || []
  );
  const [selectedLocations, setSelectedLocations] = useState(
    formState.roleData?.selectedLocations || []
  );

  // Format categories for hierarchical dropdown - using useCallback to prevent recreation on every render
  const formatCategoriesForDropdown = useCallback(
    (categories, subcategories) => {
      return categories.map((category) => ({
        id: category.category_ID,
        name: category.name,
        children: subcategories
          .filter((sub) => sub.category_id === category.category_ID)
          .map((sub) => ({
            id: sub.subcategory_id,
            name: sub.name,
            categoryId: sub.category_id,
            categoryName: category.name,
          })),
      }));
    },
    []
  );

  // Format locations for hierarchical dropdown - using useCallback to prevent recreation on every render
  const formatLocationsForDropdown = useCallback((locations) => {
    return locations.map((location) => ({
      id: location.id,
      name: location.name,
      children: location.districts.map((district) => ({
        id: district.id,
        name: district.name,
        governorateId: location.id,
        governorateName: location.name,
      })),
    }));
  }, []);

  // Fetch categories and subcategories when in attendee mode
  useEffect(() => {
    if (formState.user_type === "attendee") {
      const fetchCategoriesData = async () => {
        try {
          setLoadingCategories(true);
          const categoriesResponse = await getCategories();
          const allSubcategoriesResponse = await getSubcategoriesByCategoryId(
            ""
          );

          if (categoriesResponse.success && allSubcategoriesResponse.success) {
            const formattedCategories = formatCategoriesForDropdown(
              categoriesResponse.data.categories,
              allSubcategoriesResponse.data.subcategories
            );
            setCategories(formattedCategories);
          } else {
            /* log removed */
          }
        } catch (error) {
          /* log removed */
        } finally {
          setLoadingCategories(false);
        }
      };

      fetchCategoriesData();
    }
  }, [formState.user_type, formatCategoriesForDropdown]);

  // Fetch locations when in attendee mode
  useEffect(() => {
    if (formState.user_type === "attendee") {
      const fetchLocationsData = async () => {
        try {
          setLoadingLocations(true);
          const locationsResponse = await getAllLocations();

          if (locationsResponse.success) {
            const formattedLocations = formatLocationsForDropdown(
              locationsResponse.data.locations
            );
            setLocations(formattedLocations);
          } else {
            /* log removed */
          }
        } catch (error) {
          /* log removed */
        } finally {
          setLoadingLocations(false);
        }
      };

      fetchLocationsData();
    }
  }, [formState.user_type, formatLocationsForDropdown]);

  // Handle interest selection for attendee
  const handleInterestChange = (selected) => {
    setSelectedInterests(selected);

    // Update formState with selected interests
    handleRoleDataChange({
      target: {
        name: "selectedInterests",
        value: selected,
      },
    });

    // Also update the interests field as a comma-separated string of names for backward compatibility
    const interestsString = selected.map((item) => item.name).join(", ");
    handleRoleDataChange({
      target: {
        name: "interests",
        value: interestsString,
      },
    });
  };

  // Handle location selection for attendee
  const handleLocationChange = (selected) => {
    setSelectedLocations(selected);

    // Update formState with selected locations
    handleRoleDataChange({
      target: {
        name: "selectedLocations",
        value: selected,
      },
    });

    // Also update the locationPreferences field as a comma-separated string of names for backward compatibility
    const locationsString = selected.map((item) => item.name).join(", ");
    handleRoleDataChange({
      target: {
        name: "locationPreferences",
        value: locationsString,
      },
    });
  };

  // Render different form fields based on user type
  const renderRoleSpecificFields = () => {
    switch (formState.user_type) {
      case "vendor":
        return (
          <>
            <div className={styles.inputGroup}>
              <div
                className={`${styles.floatingInputWrapper} ${
                  formState.touched?.["roleData.vendor_name"] &&
                  formState.errors?.["roleData.vendor_name"]
                    ? styles.error
                    : ""
                }`}
              >
                <span className={styles.inputIcon}>🏢</span>
                <input
                  type="text"
                  id="vendor_name"
                  name="vendor_name"
                  className={styles.floatingInput}
                  value={formState.roleData?.vendor_name || ""}
                  onChange={handleRoleDataChange}
                  placeholder=""
                  required
                />
                <label
                  htmlFor="vendor_name"
                  className={`${styles.floatingLabel} ${
                    formState.roleData?.vendor_name ? styles.hasContent : ""
                  }`}
                >
                  Vendor Name
                </label>
              </div>
              {formState.touched?.["roleData.vendor_name"] &&
                formState.errors?.["roleData.vendor_name"] && (
                  <div className={styles.errorMessage}>
                    {formState.errors["roleData.vendor_name"]}
                  </div>
                )}
            </div>

            <div className={styles.inputGroup}>
              <div
                className={`${styles.floatingInputWrapper} ${
                  formState.touched?.["roleData.vendor_type"] &&
                  formState.errors?.["roleData.vendor_type"]
                    ? styles.error
                    : ""
                }`}
              >
                <span className={styles.inputIcon}>📋</span>
                <select
                  id="vendor_type"
                  name="vendor_type"
                  className={`${styles.floatingInput} ${styles.gender}`}
                  value={formState.roleData?.vendor_type || ""}
                  onChange={handleRoleDataChange}
                  required
                >
                  <option value="" disabled>
                    Select vendor type
                  </option>
                  <option value="food">Food {"&"} Beverage</option>
                  <option value="retail">Retail {"&"} Merchandise</option>
                  <option value="services">Services</option>
                  <option value="technology">Technology</option>
                  <option value="other">Other</option>
                </select>
                {!formState.roleData?.vendor_type && (
                  <div className={styles.datePlaceholder}>
                    Select Vendor Type
                  </div>
                )}
              </div>
              {formState.touched?.["roleData.vendor_type"] &&
                formState.errors?.["roleData.vendor_type"] && (
                  <div className={styles.errorMessage}>
                    {formState.errors["roleData.vendor_type"]}
                  </div>
                )}
            </div>

            <div className={styles.inputGroup}>
              <div
                className={`${styles.floatingInputWrapper} ${
                  formState.touched?.["roleData.website"] &&
                  formState.errors?.["roleData.website"]
                    ? styles.error
                    : ""
                }`}
              >
                <span className={styles.inputIcon}>🌐</span>
                <input
                  type="url"
                  id="website"
                  name="website"
                  className={styles.floatingInput}
                  value={formState.roleData?.website || ""}
                  onChange={handleRoleDataChange}
                  placeholder=""
                />
                <label
                  htmlFor="website"
                  className={`${styles.floatingLabel} ${
                    formState.roleData?.website ? styles.hasContent : ""
                  }`}
                >
                  Website (Optional)
                </label>
              </div>
              {formState.touched?.["roleData.website"] &&
                formState.errors?.["roleData.website"] && (
                  <div className={styles.errorMessage}>
                    {formState.errors["roleData.website"]}
                  </div>
                )}
            </div>
          </>
        );

      case "organizer":
        return (
          <>
            <div className={styles.inputGroup}>
              <div
                className={`${styles.floatingInputWrapper} ${
                  formState.touched?.["roleData.company_name"] &&
                  formState.errors?.["roleData.company_name"]
                    ? styles.error
                    : ""
                }`}
              >
                <span className={styles.inputIcon}>🏢</span>
                <input
                  type="text"
                  id="company_name"
                  name="company_name"
                  className={styles.floatingInput}
                  value={formState.roleData?.company_name || ""}
                  onChange={handleRoleDataChange}
                  placeholder=""
                  required
                />
                <label
                  htmlFor="company_name"
                  className={`${styles.floatingLabel} ${
                    formState.roleData?.company_name ? styles.hasContent : ""
                  }`}
                >
                  Company/Organization Name
                </label>
              </div>
              {formState.touched?.["roleData.company_name"] &&
                formState.errors?.["roleData.company_name"] && (
                  <div className={styles.errorMessage}>
                    {formState.errors["roleData.company_name"]}
                  </div>
                )}
            </div>

            <div className={styles.inputGroup}>
              <div
                className={`${styles.floatingInputWrapper} ${
                  formState.touched?.["roleData.organization_type"] &&
                  formState.errors?.["roleData.organization_type"]
                    ? styles.error
                    : ""
                }`}
              >
                <span className={styles.inputIcon}>📋</span>
                <select
                  id="organization_type"
                  name="organization_type"
                  className={`${styles.floatingInput} ${styles.gender}`}
                  value={formState.roleData?.organization_type || ""}
                  onChange={handleRoleDataChange}
                  required
                >
                  <option value="" disabled>
                    Select organization type
                  </option>
                  <option value="corporate">Corporate</option>
                  <option value="non_profit">Non-Profit</option>
                  <option value="government">Government</option>
                  <option value="educational">Educational</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="other">Other</option>
                </select>
                {!formState.roleData?.organization_type && (
                  <div className={styles.datePlaceholder}>
                    Select Organization Type
                  </div>
                )}
              </div>
              {formState.touched?.["roleData.organization_type"] &&
                formState.errors?.["roleData.organization_type"] && (
                  <div className={styles.errorMessage}>
                    {formState.errors["roleData.organization_type"]}
                  </div>
                )}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.checkboxGroupLabel}>
                Event Types You Organize
              </label>
              <div className={styles.checkboxContainer}>
                {[
                  "conferences",
                  "workshops",
                  "concerts",
                  "festivals",
                  "sports",
                  "corporate",
                  "social",
                ].map((type) => (
                  <div key={type} className={styles.checkboxItem}>
                    <input
                      type="checkbox"
                      id={`event_type_${type}`}
                      name={`event_types_${type}`}
                      checked={
                        formState.roleData?.[`event_types_${type}`] || false
                      }
                      onChange={(e) =>
                        handleRoleDataChange({
                          target: {
                            name: `event_types_${type}`,
                            type: "checkbox",
                            checked: e.target.checked,
                          },
                        })
                      }
                    />
                    <label htmlFor={`event_type_${type}`}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </>
        );

      case "venue":
        return (
          <>
            <p className={styles.roleSpecificDescription}>
              Please provide information about your venue management company
            </p>

            <div className={styles.inputGroup}>
              <div
                className={`${styles.floatingInputWrapper} ${
                  formState.touched?.["roleData.venue_name"] &&
                  formState.errors?.["roleData.venue_name"]
                    ? styles.error
                    : ""
                }`}
              >
                <span className={styles.inputIcon}>🏢</span>
                <input
                  type="text"
                  id="venue_name"
                  name="venue_name"
                  className={styles.floatingInput}
                  value={formState.roleData?.venue_name || ""}
                  onChange={handleRoleDataChange}
                  placeholder=""
                  required
                />
                <label
                  htmlFor="venue_name"
                  className={`${styles.floatingLabel} ${
                    formState.roleData?.venue_name ? styles.hasContent : ""
                  }`}
                >
                  Name
                </label>
              </div>
              {formState.touched?.["roleData.venue_name"] &&
                formState.errors?.["roleData.venue_name"] && (
                  <div className={styles.errorMessage}>
                    {formState.errors["roleData.venue_name"]}
                  </div>
                )}
            </div>

            <div className={styles.inputGroup}>
              <div
                className={`${styles.floatingInputWrapper} ${
                  formState.touched?.["roleData.address"] &&
                  formState.errors?.["roleData.address"]
                    ? styles.error
                    : ""
                }`}
              >
                <span className={styles.inputIcon}>📍</span>
                <input
                  type="text"
                  id="address"
                  name="address"
                  className={styles.floatingInput}
                  value={formState.roleData?.address || ""}
                  onChange={handleRoleDataChange}
                  placeholder=""
                  required
                />
                <label
                  htmlFor="address"
                  className={`${styles.floatingLabel} ${
                    formState.roleData?.address ? styles.hasContent : ""
                  }`}
                >
                  Address
                </label>
              </div>
              {formState.touched?.["roleData.address"] &&
                formState.errors?.["roleData.address"] && (
                  <div className={styles.errorMessage}>
                    {formState.errors["roleData.address"]}
                  </div>
                )}
            </div>

            <div className={styles.inputGroup}>
              <div
                className={`${styles.floatingInputWrapper} ${
                  formState.touched?.["roleData.tax_number"] &&
                  formState.errors?.["roleData.tax_number"]
                    ? styles.error
                    : ""
                }`}
              >
                <span className={styles.inputIcon}>🧾</span>
                <input
                  type="text"
                  id="tax_number"
                  name="tax_number"
                  className={styles.floatingInput}
                  value={formState.roleData?.tax_number || ""}
                  onChange={handleRoleDataChange}
                  placeholder=""
                  required
                  pattern="^[A-Za-z0-9]{5,15}$"
                  title="Tax number must be 5-15 alphanumeric characters"
                />
                <label
                  htmlFor="tax_number"
                  className={`${styles.floatingLabel} ${
                    formState.roleData?.tax_number ? styles.hasContent : ""
                  }`}
                >
                  Tax Number
                </label>
              </div>
              {formState.touched?.["roleData.tax_number"] &&
                formState.errors?.["roleData.tax_number"] && (
                  <div className={styles.errorMessage}>
                    {formState.errors["roleData.tax_number"]}
                  </div>
                )}
            </div>

            <div className={styles.inputGroup}>
              <div
                className={`${styles.floatingInputWrapper} ${
                  formState.touched?.["roleData.working_hours"] &&
                  formState.errors?.["roleData.working_hours"]
                    ? styles.error
                    : ""
                }`}
              >
                <span className={styles.inputIcon}>🕒</span>
                <select
                  id="working_hours"
                  name="working_hours"
                  className={`${styles.floatingInput} ${styles.gender}`}
                  value={formState.roleData?.working_hours || ""}
                  onChange={handleRoleDataChange}
                  required
                >
                  <option value="" disabled>
                    Select working hours
                  </option>
                  <option value="9AM-5PM">9:00 AM - 5:00 PM</option>
                  <option value="8AM-4PM">8:00 AM - 4:00 PM</option>
                  <option value="10AM-6PM">10:00 AM - 6:00 PM</option>
                  <option value="24/7">24/7 (Always Open)</option>
                  <option value="custom">Custom Hours</option>
                </select>
                {!formState.roleData?.working_hours && (
                  <div className={styles.datePlaceholder}>
                    Select Working Hours
                  </div>
                )}
              </div>
              {formState.touched?.["roleData.working_hours"] &&
                formState.errors?.["roleData.working_hours"] && (
                  <div className={styles.errorMessage}>
                    {formState.errors["roleData.working_hours"]}
                  </div>
                )}
            </div>

            {formState.roleData?.working_hours === "custom" && (
              <div className={styles.inputGroup}>
                <div
                  className={`${styles.floatingInputWrapper} ${
                    formState.touched?.["roleData.custom_hours"] &&
                    formState.errors?.["roleData.custom_hours"]
                      ? styles.error
                      : ""
                  }`}
                >
                  <span className={styles.inputIcon}>📝</span>
                  <input
                    type="text"
                    id="custom_hours"
                    name="custom_hours"
                    className={styles.floatingInput}
                    value={formState.roleData?.custom_hours || ""}
                    onChange={handleRoleDataChange}
                    placeholder=""
                    required={formState.roleData?.working_hours === "custom"}
                  />
                  <label
                    htmlFor="custom_hours"
                    className={`${styles.floatingLabel} ${
                      formState.roleData?.custom_hours ? styles.hasContent : ""
                    }`}
                  >
                    Custom Working Hours
                  </label>
                </div>
                <div className={styles.fieldHint}>
                  Example: Mon-Fri: 9AM-6PM, Sat: 10AM-4PM
                </div>
                {formState.touched?.["roleData.custom_hours"] &&
                  formState.errors?.["roleData.custom_hours"] && (
                    <div className={styles.errorMessage}>
                      {formState.errors["roleData.custom_hours"]}
                    </div>
                  )}
              </div>
            )}

            <div className={styles.inputGroup}>
              <label className={styles.uploadLabel}>Company Logo</label>
              <div className={styles.uploadContainer}>
                <input
                  type="file"
                  id="logo"
                  name="logo"
                  accept="image/*"
                  className={styles.fileInput}
                  onChange={async (e) => {
                    // Actual file upload handling
                    const file = e.target.files[0];
                    if (file) {
                      // Validate file size (max 2MB)
                      if (file.size > 2 * 1024 * 1024) {
                        handleRoleDataChange({
                          target: {
                            name: "logo_error",
                            value: "File size exceeds 2MB limit",
                          },
                        });
                        return;
                      }

                      // Clear previous error if any
                      if (formState.roleData?.logo_error) {
                        handleRoleDataChange({
                          target: {
                            name: "logo_error",
                            value: "",
                          },
                        });
                      }

                      // Show uploading status
                      handleRoleDataChange({
                        target: {
                          name: "logo",
                          value: "Uploading...",
                        },
                      });

                      try {
                        // Create a FormData object to send the file
                        const formData = new FormData();
                        formData.append("logo", file);

                        // Upload the file to the server
                        const response = await fetch(
                          "https://connviabackend-production.up.railway.app/api/auth/upload-logo",
                          {
                            method: "POST",
                            body: formData,
                          }
                        );

                        const result = await response.json();

                        if (result.success) {
                          // Store the filename returned from the server
                          handleRoleDataChange({
                            target: {
                              name: "logo",
                              value: result.filename,
                            },
                          });
                        } else {
                          // Handle upload error
                          handleRoleDataChange({
                            target: {
                              name: "logo_error",
                              value: result.error || "Failed to upload logo",
                            },
                          });

                          // Clear the logo field
                          handleRoleDataChange({
                            target: {
                              name: "logo",
                              value: "",
                            },
                          });
                        }
                      } catch (error) {
                        /* log removed */

                        // Handle upload error
                        handleRoleDataChange({
                          target: {
                            name: "logo_error",
                            value: "Failed to upload logo. Please try again.",
                          },
                        });

                        // Clear the logo field
                        handleRoleDataChange({
                          target: {
                            name: "logo",
                            value: "",
                          },
                        });
                      }
                    }
                  }}
                />
                <label htmlFor="logo" className={styles.uploadButton}>
                  <span className={styles.uploadIcon}>📷</span>
                  {formState.roleData?.logo
                    ? formState.roleData.logo
                    : "Choose Logo Image"}
                </label>
              </div>
              {formState.roleData?.logo_error && (
                <div className={styles.errorMessage}>
                  {formState.roleData.logo_error}
                </div>
              )}
              {formState.touched?.["roleData.logo"] &&
                formState.errors?.["roleData.logo"] && (
                  <div className={styles.errorMessage}>
                    {formState.errors["roleData.logo"]}
                  </div>
                )}
              <div className={styles.fieldHint}>
                Maximum file size: 2MB. Recommended format: JPG, PNG
              </div>
            </div>
          </>
        );

      case "attendee":
        return (
          <>
            <p className={styles.roleSpecificDescription}>
              Please tell us about your event preferences to help us recommend
              events you&apos;ll love
            </p>

            <div className={styles.inputGroup}>
              <HierarchicalMultiSelect
                label="Your Interests"
                icon="🎭"
                options={categories}
                selectedItems={selectedInterests}
                onChange={handleInterestChange}
                placeholder="Select your interests"
                error={
                  formState.touched?.["roleData.interests"]
                    ? formState.errors?.["roleData.interests"]
                    : ""
                }
                touched={formState.touched?.["roleData.interests"] || false}
                loading={loadingCategories}
                loadingText="Loading categories..."
              />
              <div className={styles.fieldHint}>
                Select categories and subcategories you&apos;re interested in
              </div>
            </div>

            <div className={styles.inputGroup}>
              <HierarchicalMultiSelect
                label="Location Preferences"
                icon="📍"
                options={locations}
                selectedItems={selectedLocations}
                onChange={handleLocationChange}
                placeholder="Select your preferred locations"
                error={
                  formState.touched?.["roleData.locationPreferences"]
                    ? formState.errors?.["roleData.locationPreferences"]
                    : ""
                }
                touched={
                  formState.touched?.["roleData.locationPreferences"] || false
                }
                loading={loadingLocations}
                loadingText="Loading locations..."
              />
              <div className={styles.fieldHint}>
                Select governorates and districts you prefer for events
              </div>
            </div>
          </>
        );

      default:
        return (
          <div className={styles.noUserType}>
            <p>Please go back and select a user type first.</p>
          </div>
        );
    }
  };

  return (
    <>
      <div className={styles.formScrollContainer}>
        <h2 className={styles.stepTitle}>
          {formState.user_type === "vendor" && "Vendor Information"}
          {formState.user_type === "organizer" && "Organizer Information"}
          {formState.user_type === "venue" &&
            "Venue Management Company Information"}
          {formState.user_type === "attendee" && "Additional Information"}
        </h2>
        {/* Removed the generic paragraph */}

        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          {renderRoleSpecificFields()}
        </form>
      </div>

      {/* Navigation buttons - outside of scrollable area */}
      <div className={styles.navigationContainer}>
        <button
          type="button"
          className={styles.backButton}
          onClick={handlePrevStep}
        >
          Back
        </button>
        <button
          type="button"
          className={styles.nextButton}
          onClick={handleNextStep}
        >
          Next
        </button>
      </div>
    </>
  );
};

RoleSpecificStep.propTypes = {
  formState: PropTypes.shape({
    user_type: PropTypes.string,
    roleData: PropTypes.object,
    touched: PropTypes.object,
    errors: PropTypes.object,
  }).isRequired,
  handleRoleDataChange: PropTypes.func.isRequired,
  handleNextStep: PropTypes.func.isRequired,
  handlePrevStep: PropTypes.func.isRequired,
};

export default RoleSpecificStep;
