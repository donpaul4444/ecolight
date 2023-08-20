{/* <script>
      const form=document.getElementById("myForm")
      form.addEventListener("submit", function (event) {
        event.preventDefault();
       const data={
        name:form.name.value,
        mobile:form.mobile.value,
        email:form.email.value,
        password:form.password.value,
        repeatpassword:form.repeatpassword.value
       }
       console.log(data);
        fetch("/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data),
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        window.location.href = "/banners/"
                    }
                })
                .catch(error => {
                    console.error("Error:", error)
                })
      });
    </script> */}


   