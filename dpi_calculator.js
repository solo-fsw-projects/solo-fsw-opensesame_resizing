create_content_wrapper = () => {
  var content_wrapper = document.createElement('div');
  content_wrapper.id = 'content-wrapper';
  content_wrapper.style.display = 'flex';
  content_wrapper.style.flexDirection = 'column';
  content_wrapper.style.margin = 'auto';
  content_wrapper.style.width = '100%';
  content_wrapper.style.flex = '1 1 100%';
  content_wrapper.style.overflowY = 'auto';
  document.body.appendChild(content_wrapper);
  return content_wrapper;
}

content_div = (content_wrapper) => {
  var content = document.createElement('div');
  content.id = 'content';
  content.style.textAlign = 'center';
  content.style.margin = 'auto';

  let insert_name = document.createElement('div');
  insert_name.id = 'insert_name';
  insert_name.style.width = '900px';
  insert_name.style.margin = '0 auto';

  create_resize_element(insert_name);
  content.appendChild(insert_name);
  content_wrapper.appendChild(content);
}

create_resize_element = (insert_name) => {
  let page_size = document.createElement('div');
  page_size.id = 'page_size';
  insert_name.appendChild(page_size);
  let aspect_ratio = 85.6 / 53.98;
  let resize_element = document.createElement('div');
  resize_element.id = 'resize_element';
  let start_div_height = 
      aspect_ratio < 1 ? 250 : Math.round(250 / aspect_ratio); // aspect ratio < 1 means width < height
  let start_div_width = 
      aspect_ratio < 1 ? Math.round(250 / aspect_ratio) : 250;
  var adjust_size = Math.round(start_div_width * 0.1);
  
  resize_element.style.border = 'none';
  resize_element.style.height = start_div_height + 'px';
  resize_element.style.width = start_div_width + 'px';
  resize_element.style.margin = '5px auto';
  resize_element.style.background = '#006600';
  resize_element.style.position = 'relative';

  create_drag_element(resize_element, adjust_size);
  page_size.appendChild(resize_element);
}

create_drag_element = (resize_element, adjust_size) => {
  let drag_element = document.createElement('div');
  drag_element.id = 'drag_element';
  drag_element.style.position = 'absolute';
  drag_element.style.cursor = 'nwse-resize';
  drag_element.style.bottom = '0';
  drag_element.style.right = '0';
  drag_element.style.width = adjust_size + 'px';
  drag_element.style.height = adjust_size + 'px';
  drag_element.style.border = '1px solid red';
  drag_element.style.backgroundColor = 'none';
  drag_element.style.borderLeft = '0';
  drag_element.style.borderTop = '0';
  drag_element.style.cursor = 'move';
  resize_element.appendChild(drag_element);
}

resize_object = () => {
  let dragging = false;
  let resize_element = document.getElementById('resize_element');
  let px2mm = 0;
  let calculated_dpi = 0;
  if (!resize_element) {
      throw new Error('Resize element not found');
  };

  let original_height = parseInt(resize_element.style.height);
  let original_width = parseInt(resize_element.style.width);
  let origin_x, origin_y;
  let aspect_ratio = 85.6 / 53.98;

  document.addEventListener('mouseup', () => {
      dragging = false;
  })

  function mouse_down_event(e) {
      e.preventDefault();
      dragging = true;
      origin_x = e.pageX;
      origin_y = e.pageY;
  }

  document.querySelector('#drag_element')?.addEventListener('mousedown', mouse_down_event);

  let dpi_text = document.createElement('div');
  dpi_text.id = 'dpi_text';
  dpi_text.style.textAlign = 'center';
  dpi_text.style.marginTop = '10px';
  dpi_text.innerText = `DPI: ${calculated_dpi.toFixed(2)}`;
  document.body.appendChild(dpi_text);

  document.addEventListener('mousemove', (e) => {
      if (dragging) {
          let dx = e.pageX - origin_x;
          let dy = e.pageY - origin_y;
          let new_width = original_width + dx;
          let new_height = original_height + dy;
          resize_element.style.width = new_width + 'px';
          resize_element.style.height = Math.round(new_height / aspect_ratio) + 'px';
          let element_width = resize_element.getBoundingClientRect().width;
          px2mm = element_width / 85.6;
          calculated_dpi = px2mm / 0.03937;
          dpi_text.innerText = `DPI: ${calculated_dpi.toFixed(2)}`;
      }
  });
}

main = () => {
  var content_wrapper = create_content_wrapper();
  content_div(content_wrapper);
  resize_object();
}

main();