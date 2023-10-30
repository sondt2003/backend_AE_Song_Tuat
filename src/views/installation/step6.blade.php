@extends('layouts.blank')
@section('content')
    <div class="container">
        <div class="card mt-6">
            <div class="card-body">
                <div class="row pt-5">
                    <div class="col-md-12">
                        <div class="pad-btm text-center">
                            <h1 class="h3">All Done, Great Job.</h1>
                            <p>Your software is ready to run.</p>
                            <div class="row">
                                <div class="col-3"></div>
                                <div class="col-sm-6 col-sm-offset-2">
                                    <div class="panel bord-all mar-top panel-info">
                                        <div class="panel-heading">
                                            <h3 class="panel-title">
                                                Configure the following setting from business settings to run the system
                                                properly.
                                            </h3>
                                        </div>
                                        <div class="panel-body">
                                            <ul class="list-group mar-no mar-top bord-no">
                                                <li class="list-group-item">MAIL Setting</li>
                                                <li class="list-group-item">Payment Method Configuration</li>
                                                <li class="list-group-item">SMS Module Configuration</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-3"></div>
                            </div>
                        </div>

                        @php
                        $data = \App\Models\DataSetting::where('type', 'login_admin')->pluck('value')->first();
                        @endphp
                    <div class="text-center pt-3">
                        <a href="{{ env('APP_URL') }}/login/{{$data}}" target="_blank" class="btn btn-info">Admin Panel</a>
                    </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
