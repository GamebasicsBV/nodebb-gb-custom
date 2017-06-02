<form role="form" class="gb-custom-settings">
	<div class="row">
		<div class="col-md-9">
			<div class="row">
				<div class="col-sm-2 col-xs-12 settings-header">General</div>
				<div class="col-sm-10 col-xs-12">
					<div class="form-group">
						<label for="cookieName">Cookie naam</label>
						<input type="text" id="cookieName" name="cookieName" title="Cookie Name" class="form-control" placeholder="token" />
                        <p class="help-block">
							De naam die we geven aan de hwt cookie zodra die geset wordt vanuit onze webapi (moet hetzelfde zijn als in de session sharing plugin)
						</p>
					</div>
					<div class="form-group">
						<label for="secret">JWT secret</label>
						<input type="text" id="secret" name="secret" title="JWT Secret" class="form-control" />
						<p class="help-block">
							De secret die we gebruiken om de forum cookie te encoden, is nodig om de info eruit op te halen. <strong>Moet hetzelfde zijn als de secret uit de session-sharing plugin!</strong>
						</p>
					</div>
                    <div class="form-group">
						<label for="secret">Language Code Prefix</label>
						<input type="text" id="languageCodePrefix" name="languageCodePrefix" title="Language code prefix" class="form-control" />
						<p class="help-block">
							De languagecode prefix om de user de language group te laten joinen (<strong> let op de spatie aan het eind! </strong>)
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</form>

<button id="save" class="floating-button mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored">
	<i class="material-icons">save</i>
</button>