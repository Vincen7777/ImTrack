const SIDEBAR_ITEMS: string[] = ["Dashboard", "Tasks", "Calendar", "Settings"];

function ProductPreview() {
  return (
    <>
    <section className="product-preview" aria-label="Product Interface Preview">
      <div className="preview-container">
        <div className="preview-mockup">
          <div className="preview-header">
            <div className="window-controls">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            <div className="window-title">ImTrack Workspace</div>
          </div>

          <div className="preview-body">
            <div className="mockup-sidebar">
              {SIDEBAR_ITEMS.map((item, i) => (
                <div
                  key={item}
                  className={`ms-item${i === 0 ? " active" : ""}`}
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="mockup-content">
              <div className="mc-header">
                <div className="mc-title">Dashboard</div>
                <div className="mc-avatars">
                  <div className="av">A</div>
                  <div className="av">B</div>
                </div>
              </div>
              <div className="mc-cards">
                <div className="mc-card"></div>
                <div className="mc-card"></div>
                <div className="mc-card"></div>
              </div>
              <div className="mc-list">
                <div className="mcl-item"></div>
                <div className="mcl-item"></div>
                <div className="mcl-item"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
export default ProductPreview