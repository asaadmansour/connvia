import { useState } from "react";
import Video from "./Video";
import { Reorder } from "framer-motion";
import styles from "./InfoSection.module.css";

const initialButtons = [
  { id: 1, label: "🎟️ My Tickets" },
  { id: 3, label: "📅 Event Calendar" },
  { id: 4, label: "📍 Nearby Events" },
  { id: 5, label: "🔔 Notifications" },
  { id: 6, label: "🚀 Explore More" },
  { id: 7, label: "💬 Stay Updated" },
];

function InfoSection() {
  const [buttons, setButtons] = useState(initialButtons);

  return (
    <div className={styles.infoSection}>
      <Video overlay={0.9} />
      <div className={styles.infoContent}>
        <h2 className={styles.infoTitle}>One app for all occasions</h2>
        <p className={styles.infoDescription}>
          Single account for all your events
        </p>

        <div className={styles.partnerSection}>
          {/* Reorder.Group enables drag-and-drop */}
          <Reorder.Group
            axis="y"
            values={buttons}
            onReorder={setButtons}
            className={styles.partners}
          >
            {buttons.map((button) => (
              <Reorder.Item
                key={button.id}
                value={button}
                drag
                className={styles.partner}
                whileDrag={{ scale: 1.05 }}
              >
                {button.label}
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      </div>
    </div>
  );
}

export default InfoSection;
