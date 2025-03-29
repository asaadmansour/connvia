import PropTypes from 'prop-types';
import styles from './RoleSpecificStep.module.css';

const RoleSpecificStep = ({ formState, handleRoleDataChange, handleNextStep, handlePrevStep }) => {
  // Render different form fields based on user type
  const renderRoleSpecificFields = () => {
    switch (formState.user_type) {
      case 'vendor':
        return (
          <>
            <div className={`${styles.formGroup} ${formState.touched['roleData.vendor_name'] && formState.errors['roleData.vendor_name'] ? styles.hasError : ""}`}>
              <label htmlFor="vendor_name">Vendor Name *</label>
              <input
                type="text"
                id="vendor_name"
                name="vendor_name"
                value={formState.roleData.vendor_name || ''}
                onChange={handleRoleDataChange}
                placeholder="Enter your business name"
                required
              />
              {formState.touched['roleData.vendor_name'] && formState.errors['roleData.vendor_name'] && (
                <div className={styles.errorMessage}>{formState.errors['roleData.vendor_name']}</div>
              )}
            </div>
            
            <div className={`${styles.formGroup} ${formState.touched['roleData.vendor_type'] && formState.errors['roleData.vendor_type'] ? styles.hasError : ""}`}>
              <label htmlFor="vendor_type">Vendor Type *</label>
              <select
                id="vendor_type"
                name="vendor_type"
                value={formState.roleData.vendor_type || ''}
                onChange={handleRoleDataChange}
                required
              >
                <option value="">Select vendor type</option>
                <option value="food">Food & Beverage</option>
                <option value="retail">Retail & Merchandise</option>
                <option value="services">Services</option>
                <option value="technology">Technology</option>
                <option value="other">Other</option>
              </select>
              {formState.touched['roleData.vendor_type'] && formState.errors['roleData.vendor_type'] && (
                <div className={styles.errorMessage}>{formState.errors['roleData.vendor_type']}</div>
              )}
            </div>
            
            <div className={`${styles.formGroup} ${formState.touched['roleData.website'] && formState.errors['roleData.website'] ? styles.hasError : ""}`}>
              <label htmlFor="website">Website (Optional)</label>
              <input
                type="url"
                id="website"
                name="website"
                value={formState.roleData.website || ''}
                onChange={handleRoleDataChange}
                placeholder="https://yourwebsite.com"
              />
              {formState.touched['roleData.website'] && formState.errors['roleData.website'] && (
                <div className={styles.errorMessage}>{formState.errors['roleData.website']}</div>
              )}
            </div>
          </>
        );
        
      case 'organizer':
        return (
          <>
            <div className={`${styles.formGroup} ${formState.touched['roleData.company_name'] && formState.errors['roleData.company_name'] ? styles.hasError : ""}`}>
              <label htmlFor="company_name">Company/Organization Name *</label>
              <input
                type="text"
                id="company_name"
                name="company_name"
                value={formState.roleData.company_name || ''}
                onChange={handleRoleDataChange}
                placeholder="Enter your organization name"
                required
              />
              {formState.touched['roleData.company_name'] && formState.errors['roleData.company_name'] && (
                <div className={styles.errorMessage}>{formState.errors['roleData.company_name']}</div>
              )}
            </div>
            
            <div className={`${styles.formGroup} ${formState.touched['roleData.organization_type'] && formState.errors['roleData.organization_type'] ? styles.hasError : ""}`}>
              <label htmlFor="organization_type">Organization Type *</label>
              <select
                id="organization_type"
                name="organization_type"
                value={formState.roleData.organization_type || ''}
                onChange={handleRoleDataChange}
                required
              >
                <option value="">Select organization type</option>
                <option value="corporate">Corporate</option>
                <option value="non_profit">Non-Profit</option>
                <option value="government">Government</option>
                <option value="educational">Educational</option>
                <option value="entertainment">Entertainment</option>
                <option value="other">Other</option>
              </select>
              {formState.touched['roleData.organization_type'] && formState.errors['roleData.organization_type'] && (
                <div className={styles.errorMessage}>{formState.errors['roleData.organization_type']}</div>
              )}
            </div>
            
            <div className={styles.formGroup}>
              <label>Event Types You Organize</label>
              <div className={styles.checkboxGroup}>
                {['conferences', 'workshops', 'concerts', 'festivals', 'sports', 'corporate', 'social'].map(type => (
                  <div key={type} className={styles.checkboxItem}>
                    <input
                      type="checkbox"
                      id={`event_type_${type}`}
                      name={`event_types_${type}`}
                      checked={formState.roleData[`event_types_${type}`] || false}
                      onChange={(e) => handleRoleDataChange({
                        target: {
                          name: `event_types_${type}`,
                          type: 'checkbox',
                          checked: e.target.checked
                        }
                      })}
                    />
                    <label htmlFor={`event_type_${type}`}>{type.charAt(0).toUpperCase() + type.slice(1)}</label>
                  </div>
                ))}
              </div>
            </div>
          </>
        );
        
      case 'venue':
        return (
          <>
            <div className={`${styles.formGroup} ${formState.touched['roleData.venue_name'] && formState.errors['roleData.venue_name'] ? styles.hasError : ""}`}>
              <label htmlFor="venue_name">Venue Name *</label>
              <input
                type="text"
                id="venue_name"
                name="venue_name"
                value={formState.roleData.venue_name || ''}
                onChange={handleRoleDataChange}
                placeholder="Enter your venue name"
                required
              />
              {formState.touched['roleData.venue_name'] && formState.errors['roleData.venue_name'] && (
                <div className={styles.errorMessage}>{formState.errors['roleData.venue_name']}</div>
              )}
            </div>
            
            <div className={`${styles.formGroup} ${formState.touched['roleData.address'] && formState.errors['roleData.address'] ? styles.hasError : ""}`}>
              <label htmlFor="address">Venue Address *</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formState.roleData.address || ''}
                onChange={handleRoleDataChange}
                placeholder="Enter venue address"
                required
              />
              {formState.touched['roleData.address'] && formState.errors['roleData.address'] && (
                <div className={styles.errorMessage}>{formState.errors['roleData.address']}</div>
              )}
            </div>
            
            <div className={`${styles.formGroup} ${formState.touched['roleData.capacity'] && formState.errors['roleData.capacity'] ? styles.hasError : ""}`}>
              <label htmlFor="capacity">Venue Capacity *</label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                value={formState.roleData.capacity || ''}
                onChange={handleRoleDataChange}
                placeholder="Maximum number of people"
                required
              />
              {formState.touched['roleData.capacity'] && formState.errors['roleData.capacity'] && (
                <div className={styles.errorMessage}>{formState.errors['roleData.capacity']}</div>
              )}
            </div>
            
            <div className={styles.formGroup}>
              <label>Venue Amenities</label>
              <div className={styles.checkboxGroup}>
                {['parking', 'wifi', 'catering', 'av_equipment', 'accessibility', 'outdoor_space'].map(amenity => (
                  <div key={amenity} className={styles.checkboxItem}>
                    <input
                      type="checkbox"
                      id={`amenity_${amenity}`}
                      name={`amenity_${amenity}`}
                      checked={formState.roleData[`amenity_${amenity}`] || false}
                      onChange={(e) => handleRoleDataChange({
                        target: {
                          name: `amenity_${amenity}`,
                          type: 'checkbox',
                          checked: e.target.checked
                        }
                      })}
                    />
                    <label htmlFor={`amenity_${amenity}`}>
                      {amenity.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </>
        );
        
      case 'attendee':
        return (
          <div className={styles.attendeeMessage}>
            <div className={styles.attendeeIcon}>👍</div>
            <h3>You're all set!</h3>
            <p>As an attendee, we just need your basic information which you've already provided. Click "Next" to continue.</p>
          </div>
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
    <div className={styles.stepForm}>
      <h2 className={styles.stepTitle}>
        {formState.user_type === "vendor" && "Vendor Information"}
        {formState.user_type === "organizer" && "Organizer Information"}
        {formState.user_type === "venue" && "Venue Information"}
        {formState.user_type === "attendee" && "Additional Information"}
      </h2>
      <p className={styles.stepDescription}>
        Please provide additional details for your account
      </p>
      
      <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }}>
        {renderRoleSpecificFields()}
        
        <div className={styles.navigationButtons}>
          <button
            type="button"
            className={styles.backButton}
            onClick={handlePrevStep}
          >
            Back
          </button>
          <button type="submit" className={styles.nextButton}>
            Next Step
          </button>
        </div>
      </form>
    </div>
  );
};

RoleSpecificStep.propTypes = {
  formState: PropTypes.shape({
    user_type: PropTypes.string,
    roleData: PropTypes.object,
    touched: PropTypes.object,
    errors: PropTypes.object
  }).isRequired,
  handleChange: PropTypes.func.isRequired,
  handleRoleDataChange: PropTypes.func.isRequired,
  handleNextStep: PropTypes.func.isRequired,
  handlePrevStep: PropTypes.func.isRequired
};

export default RoleSpecificStep;