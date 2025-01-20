create_content_wrapper = () => {
  var content_wrapper = document.createElement('div');
  content_wrapper.id = 'content-wrapper';
  document.body.appendChild(content_wrapper);
  return content_wrapper;
}

content_div = (content_wrapper) => {
  var content = document.createElement('div');
  content.id = 'content';

  let boundary_box = document.createElement('div');
  boundary_box.id = 'boundary_box';

  create_resize_element(boundary_box);
  content.appendChild(boundary_box);
  content_wrapper.appendChild(content);
}

create_resize_element = (boundary_box) => {
  let aspect_ratio = 85.6 / 53.98;
  let resize_element = document.createElement('div');
  resize_element.id = 'resize_element';
  let start_div_height = 
  aspect_ratio < 1 ? 250 : Math.round(250 / aspect_ratio); // aspect ratio < 1 means width < height
  let start_div_width = 
  aspect_ratio < 1 ? Math.round(250 / aspect_ratio) : 250;
  var adjust_size = Math.round(start_div_width * 0.1);
  
  resize_element.style.height = start_div_height + 'px';
  resize_element.style.width = start_div_width + 'px';
  
  create_drag_element(resize_element, adjust_size);
  boundary_box.appendChild(resize_element);
}

create_drag_element = (resize_element, adjust_size) => {
  let drag_element = document.createElement('div');
  drag_element.id = 'drag_element';
  drag_element.style.width = adjust_size + 'px';
  drag_element.style.height = adjust_size + 'px';
  resize_element.appendChild(drag_element);
}

resize_object = () => {
  let dragging = false;
  let resize_element = document.getElementById('resize_element');
  let px2mm = 0;
  let calculated_dpi = 250 / 85.6 / 0.03937; // use initial width to calculate arbitrary dpi value
  if (!resize_element) {
      throw new Error('Resize element not found');
  };

  let original_width = parseInt(resize_element.style.width);
  let origin_x;
  let aspect_ratio = 85.6 / 53.98;

  document.addEventListener('mouseup', () => {
      dragging = false;
  })

  function mouse_down_event(e) {
      e.preventDefault();
      dragging = true;
      origin_x = e.pageX;
  }

  document.querySelector('#drag_element')?.addEventListener('mousedown', mouse_down_event);

  let dpi_text = document.createElement('div');
  dpi_text.id = 'dpi_text';

  dpi_text.style.marginTop = '10px';
  dpi_text.innerText = `DPI: ${calculated_dpi.toFixed(2)}`;
  document.body.appendChild(dpi_text);

  document.addEventListener('mousemove', (e) => {
    e.preventDefault();
    if (!dragging) {
      return;
    }

    let dx = e.pageX - origin_x;
    let new_width = original_width + dx;
    let new_height = Math.round(new_width / aspect_ratio);
    resize_element.style.width = new_width + 'px';
    resize_element.style.height = new_height + 'px';
    let element_width = resize_element.getBoundingClientRect().width;
    let px2mm_width = element_width / 85.6;
    let element_height = resize_element.getBoundingClientRect().height;
    let px2mm_height = element_height / 53.98;
    px2mm = (px2mm_width + px2mm_height) / 2;
    calculated_dpi = px2mm / 0.03937;
    dpi_text.innerText = `DPI: ${calculated_dpi.toFixed(2)}`;
  });
}

main = () => {
  var content_wrapper = create_content_wrapper();
  content_div(content_wrapper);
  resize_object();
}

main();